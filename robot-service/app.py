"""
Robot Survey Service - Flask Application
Port: 5001 (to avoid conflict with main AI service on 5000)
Uses Roboflow API for multiple issue detection
"""

from flask import Flask, render_template, request, jsonify
from inference_sdk import InferenceHTTPClient
import cv2
import os
import uuid
import base64
from PIL import Image
from datetime import datetime
import sqlite3
import random

app = Flask(__name__)

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="wDn97RYRazmoOEE8okiH"
)

UPLOAD_DIR = "static/uploads"
RESULTS_DIR = "static/results"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

MODELS = {
    "potholes": {"id": "pothole-clzln/1", "name": "Potholes", "color": (0, 0, 255)},
    "garbage": {"id": "garbage-yzrfd/1", "name": "Garbage", "color": (0, 165, 255)},
    "manholes": {"id": "manhole-e0p0b/3", "name": "Open/Broken Manholes", "color": (255, 0, 255)},
    "damaged_roads": {"id": "damaged-roads-detector/2", "name": "Damaged Roads", "color": (0, 255, 255)},
    "construction_debris": {"id": "visual-pollution-3/1", "name": "Construction Debris", "color": (255, 0, 0)},
    "stray_animals": {"id": "stray-animals-xnyc0/3", "name": "Stray Animals", "color": (0, 255, 0)},
    "water_leakage": {"id": "water-leakage/2", "name": "Water Leakage", "color": (255, 255, 0)},
    "visual_pollution": {"id": "visual-pollution-3/1", "name": "Visual Pollution", "color": (128, 0, 128)}
}

def init_db():
    conn = sqlite3.connect('robot_survey.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS surveys
                 (id INTEGER PRIMARY KEY, timestamp TEXT, latitude REAL, longitude REAL,
                  potholes INTEGER, garbage INTEGER, manholes INTEGER, damaged_roads INTEGER,
                  construction_debris INTEGER, stray_animals INTEGER, water_leakage INTEGER,
                  visual_pollution INTEGER, total_issues INTEGER, severity_score REAL,
                  description TEXT, report_type TEXT, source TEXT)''')
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def index():
    return render_template("index.html", models=MODELS)

@app.route("/admin")
def admin_dashboard():
    return render_template("admin.html")

@app.route("/robot")
def robot_interface():
    return render_template("robot.html")

@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "Robot Survey Service", "port": 5001})

@app.route("/robot/submit", methods=["POST"])
def robot_submit():
    try:
        data = request.get_json()
        image_data = data.get('image')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        robot_id = data.get('robot_id', 'unknown')
        
        image_bytes = base64.b64decode(image_data)
        filename = f"robot_{robot_id}_{uuid.uuid4()}.jpg"
        image_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(image_path, 'wb') as f:
            f.write(image_bytes)
        
        issue_counts = {key: 0 for key in MODELS.keys()}
        total_issues = 0
        severity_score = 0
        
        try:
            result = CLIENT.infer(image_path, model_id="visual-pollution-3/1")
            count = len(result["predictions"])
            issue_counts['visual_pollution'] = count
            total_issues = count
            severity_score = count * 1.0
        except:
            pass
        
        conn = sqlite3.connect('robot_survey.db')
        c = conn.cursor()
        c.execute('''INSERT INTO surveys VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                 (datetime.now().isoformat(), latitude, longitude,
                  0, 0, 0, 0, 0, 0, 0,
                  issue_counts['visual_pollution'], total_issues, severity_score,
                  '', 'robot_survey', 'robot'))
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True, 
            "total_issues": total_issues,
            "issue_counts": issue_counts
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/stats")
def get_stats():
    conn = sqlite3.connect('robot_survey.db')
    c = conn.cursor()
    c.execute('''SELECT 
                    COUNT(*) as total_surveys,
                    SUM(potholes) as total_potholes,
                    SUM(garbage) as total_garbage,
                    SUM(manholes) as total_manholes,
                    SUM(damaged_roads) as total_damaged_roads,
                    AVG(severity_score) as avg_severity
                 FROM surveys''')
    stats = c.fetchone()
    conn.close()
    
    return jsonify({
        "total_surveys": stats[0],
        "total_potholes": stats[1],
        "total_garbage": stats[2],
        "total_manholes": stats[3],
        "total_damaged_roads": stats[4],
        "avg_severity": round(stats[5] or 0, 2)
    })

@app.route("/detect", methods=["POST"])
def detect():
    """Multi-model detection endpoint for compatibility"""
    if "image" not in request.files or "model" not in request.form:
        return jsonify({"error": "Missing image or model"}), 400
    
    file = request.files["image"]
    model_key = request.form["model"]
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    description = request.form.get('description', '')
    report_type = request.form.get('reportType', model_key)
    
    if file.filename == "" or model_key not in MODELS:
        return jsonify({"error": "Invalid file or model"}), 400
    
    try:
        filename = f"{uuid.uuid4()}.jpg"
        image_path = os.path.join(UPLOAD_DIR, filename)
        
        img = Image.open(file)
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        img.save(image_path, 'JPEG', quality=95)
        
        image = cv2.imread(image_path)
        all_predictions = []
        issue_counts = {key: 0 for key in MODELS.keys()}
        
        if model_key == "all_detect":
            for key, model in MODELS.items():
                try:
                    result = CLIENT.infer(image_path, model_id=model["id"])
                    for pred in result["predictions"]:
                        pred["model_type"] = key
                        all_predictions.append(pred)
                    issue_counts[key] = len(result["predictions"])
                except:
                    continue
        else:
            model_id = MODELS[model_key]["id"]
            result = CLIENT.infer(image_path, model_id=model_id)
            for pred in result["predictions"]:
                pred["model_type"] = model_key
                all_predictions.append(pred)
            issue_counts[model_key] = len(result["predictions"])
        
        for pred in all_predictions:
            x = int(pred["x"] - pred["width"] / 2)
            y = int(pred["y"] - pred["height"] / 2)
            w = int(pred["width"])
            h = int(pred["height"])
            conf = pred["confidence"]
            class_name = pred["class"]
            model_color = MODELS[pred["model_type"]]["color"]
            
            cv2.rectangle(image, (x, y), (x + w, y + h), model_color, 2)
            label = f"{class_name} {conf:.2f}"
            cv2.putText(image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, model_color, 2)
        
        result_filename = f"result_{filename}"
        result_path = os.path.join(RESULTS_DIR, result_filename)
        cv2.imwrite(result_path, image)
        
        if latitude and longitude:
            total_issues = sum(issue_counts.values())
            severity_score = sum(count * (1.5 if key in ['potholes', 'damaged_roads'] else 1.0) 
                                for key, count in issue_counts.items())
            
            conn = sqlite3.connect('robot_survey.db')
            c = conn.cursor()
            c.execute('''INSERT INTO surveys VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                     (datetime.now().isoformat(), float(latitude), float(longitude),
                      issue_counts['potholes'], issue_counts['garbage'], issue_counts['manholes'],
                      issue_counts['damaged_roads'], issue_counts['construction_debris'],
                      issue_counts['stray_animals'], issue_counts['water_leakage'],
                      issue_counts['visual_pollution'], total_issues, severity_score,
                      description, report_type, 'manual_survey'))
            conn.commit()
            conn.close()
        
        return jsonify({
            "success": True,
            "result_image": f"/static/results/{result_filename}",
            "detections": len(all_predictions),
            "predictions": all_predictions
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run on port 5001 to avoid conflict with main AI service (port 5000)
    app.run(debug=True, host='0.0.0.0', port=5001)
