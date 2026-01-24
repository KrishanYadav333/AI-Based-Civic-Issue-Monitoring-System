from flask import Flask, render_template, request, jsonify
from inference_sdk import InferenceHTTPClient
import cv2
import os
import uuid
import json
import base64
import time
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
    conn = sqlite3.connect('road_survey.db')
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
        
        # Only use visual pollution model for robot
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
        
        conn = sqlite3.connect('road_survey.db')
        c = conn.cursor()
        c.execute('''INSERT INTO surveys VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                 (datetime.now().isoformat(), latitude, longitude,
                  0, 0, 0, 0, 0, 0, 0,  # All other issues set to 0
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

@app.route("/api/heatmap")
def get_heatmap_data():
    conn = sqlite3.connect('road_survey.db')
    c = conn.cursor()
    c.execute('SELECT latitude, longitude, total_issues, severity_score FROM surveys')
    data = c.fetchall()
    conn.close()
    
    heatmap_data = []
    for row in data:
        lat, lng, issues, severity = row
        heatmap_data.append({
            "lat": lat,
            "lng": lng,
            "intensity": min(severity / 10, 1.0)
        })
    
    return jsonify(heatmap_data)

@app.route("/api/stats")
def get_stats():
    conn = sqlite3.connect('road_survey.db')
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
            
            overlay = image.copy()
            cv2.rectangle(overlay, (x, y), (x + w, y + h), model_color, -1)
            cv2.addWeighted(overlay, 0.2, image, 0.8, 0, image)
            cv2.rectangle(image, (x, y), (x + w, y + h), model_color, 2)
            
            label = f"{class_name} {conf:.2f}"
            (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(image, (x, y - label_h - 10), (x + label_w + 10, y), (255, 255, 255), -1)
            cv2.rectangle(image, (x, y - label_h - 10), (x + label_w + 10, y), model_color, 2)
            cv2.putText(image, label, (x + 5, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        result_filename = f"result_{filename}"
        result_path = os.path.join(RESULTS_DIR, result_filename)
        cv2.imwrite(result_path, image)
        
        if latitude and longitude:
            total_issues = sum(issue_counts.values())
            severity_score = sum(count * (1.5 if key in ['potholes', 'damaged_roads'] else 1.0) for key, count in issue_counts.items())
            
            conn = sqlite3.connect('road_survey.db')
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

@app.route("/save-test-image", methods=["POST"])
def save_test_image():
    """Save uploaded images to test_images folder for direct Flask app access"""
    if "image" not in request.files:
        return jsonify({"error": "Missing image"}), 400
    
    file = request.files["image"]
    issue_type = request.form.get('issueType', 'civic_issue')
    
    if file.filename == "":
        return jsonify({"error": "Invalid file"}), 400
    
    try:
        # Create test_images directory if it doesn't exist
        test_images_dir = "test_images"
        os.makedirs(test_images_dir, exist_ok=True)
        
        # Generate filename with issue type and timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{issue_type}_{timestamp}.jpg"
        image_path = os.path.join(test_images_dir, filename)
        
        # Save image
        img = Image.open(file)
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        img.save(image_path, 'JPEG', quality=95)
        
        return jsonify({
            "success": True,
            "filename": filename,
            "path": image_path
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/detailed-stats")
def get_detailed_stats():
    conn = sqlite3.connect('road_survey.db')
    c = conn.cursor()
    
    c.execute('''SELECT 
                    COUNT(*) as total_surveys,
                    SUM(potholes) as total_potholes,
                    SUM(garbage) as total_garbage,
                    SUM(manholes) as total_manholes,
                    SUM(damaged_roads) as total_damaged_roads,
                    SUM(construction_debris) as total_construction_debris,
                    SUM(stray_animals) as total_stray_animals,
                    SUM(water_leakage) as total_water_leakage,
                    SUM(visual_pollution) as total_visual_pollution,
                    AVG(severity_score) as avg_severity
                 FROM surveys''')
    stats = c.fetchone()
    
    c.execute('''SELECT timestamp, latitude, longitude, total_issues, description, report_type 
                 FROM surveys ORDER BY timestamp DESC LIMIT 10''')
    recent_surveys = c.fetchall()
    
    c.execute('''SELECT 
                    CASE 
                        WHEN severity_score <= 2 THEN 'Low'
                        WHEN severity_score <= 5 THEN 'Medium'
                        WHEN severity_score <= 10 THEN 'High'
                        ELSE 'Critical'
                    END as severity_level,
                    COUNT(*) as count
                 FROM surveys GROUP BY severity_level''')
    severity_dist = c.fetchall()
    
    conn.close()
    
    return jsonify({
        "total_surveys": stats[0] or 0,
        "total_potholes": stats[1] or 0,
        "total_garbage": stats[2] or 0,
        "total_manholes": stats[3] or 0,
        "total_damaged_roads": stats[4] or 0,
        "total_construction_debris": stats[5] or 0,
        "total_stray_animals": stats[6] or 0,
        "total_water_leakage": stats[7] or 0,
        "total_visual_pollution": stats[8] or 0,
        "avg_severity": round(stats[9] or 0, 2),
        "recent_surveys": [{
            "timestamp": row[0],
            "latitude": row[1],
            "longitude": row[2],
            "total_issues": row[3],
            "description": row[4],
            "report_type": row[5]
        } for row in recent_surveys],
        "severity_distribution": [{
            "level": row[0],
            "count": row[1]
        } for row in severity_dist]
    })

@app.route("/api/robot-simulate", methods=["POST"])
def robot_simulate():
    try:
        test_images_dir = "test_images"
        if not os.path.exists(test_images_dir):
            os.makedirs(test_images_dir)
            return jsonify({"error": "No test images found. Please add images to test_images folder"}), 400
        
        image_files = [f for f in os.listdir(test_images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if not image_files:
            return jsonify({"error": "No image files found in test_images folder"}), 400
        
        results = []
        total_scanned = 0
        
        for image_file in image_files[:5]:
            image_path = os.path.join(test_images_dir, image_file)
            
            base_lat, base_lng = 28.6139, 77.2090
            lat = base_lat + (random.uniform(-0.01, 0.01))
            lng = base_lng + (random.uniform(-0.01, 0.01))
            
            try:
                result = CLIENT.infer(image_path, model_id="visual-pollution-3/1")
                count = len(result["predictions"])
                
                # Generate result image with bounding boxes
                result_image_path = generate_result_image(image_path, result["predictions"], image_file)
                
                conn = sqlite3.connect('road_survey.db')
                c = conn.cursor()
                c.execute('''INSERT INTO surveys VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                         (datetime.now().isoformat(), lat, lng,
                          0, 0, 0, 0, 0, 0, 0, count, count, count * 1.0,
                          f'Robot scan of {image_file}', 'robot_simulation', 'robot'))
                conn.commit()
                conn.close()
                
                results.append({
                    "image": image_file,
                    "result_image": result_image_path,
                    "latitude": lat,
                    "longitude": lng,
                    "visual_pollution_count": count,
                    "classes": [pred["class"] for pred in result["predictions"]]
                })
                total_scanned += 1
                
            except Exception as e:
                print(f"Error processing {image_file}: {e}")
                continue
        
        return jsonify({
            "success": True,
            "total_scanned": total_scanned,
            "results": results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_result_image(image_path, predictions, filename):
    """Generate result image with bounding boxes"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            return None
            
        for pred in predictions:
            x = int(pred["x"] - pred["width"] / 2)
            y = int(pred["y"] - pred["height"] / 2)
            w = int(pred["width"])
            h = int(pred["height"])
            conf = pred["confidence"]
            class_name = pred["class"]
            
            # Draw bounding box
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Draw label
            label = f"{class_name} {conf:.2f}"
            (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(image, (x, y - label_h - 10), (x + label_w + 10, y), (0, 255, 0), -1)
            cv2.putText(image, label, (x + 5, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        result_filename = f"robot_result_{filename}"
        result_path = os.path.join(RESULTS_DIR, result_filename)
        cv2.imwrite(result_path, image)
        
        return f"/static/results/{result_filename}"
        
    except Exception as e:
        print(f"Error generating result image: {e}")
        return None

# Robot-specific analytics endpoint
@app.route("/api/robot-stats")
def get_robot_stats():
    conn = sqlite3.connect('road_survey.db')
    c = conn.cursor()
    
    # Get robot-specific statistics
    c.execute('''SELECT 
                    COUNT(*) as total_robot_surveys,
                    SUM(visual_pollution) as total_visual_pollution,
                    AVG(severity_score) as avg_severity
                 FROM surveys WHERE source = 'robot' ''')
    stats = c.fetchone()
    
    # Get recent robot surveys
    c.execute('''SELECT timestamp, latitude, longitude, visual_pollution, description 
                 FROM surveys WHERE source = 'robot' ORDER BY timestamp DESC LIMIT 10''')
    recent_surveys = c.fetchall()
    
    # Get visual pollution class distribution
    c.execute('''SELECT description, visual_pollution 
                 FROM surveys WHERE source = 'robot' AND visual_pollution > 0''')
    class_data = c.fetchall()
    
    conn.close()
    
    return jsonify({
        "total_robot_surveys": stats[0] or 0,
        "total_visual_pollution": stats[1] or 0,
        "avg_severity": round(stats[2] or 0, 2),
        "recent_surveys": [{
            "timestamp": row[0],
            "latitude": row[1],
            "longitude": row[2],
            "visual_pollution": row[3],
            "description": row[4]
        } for row in recent_surveys],
        "class_distribution": class_data
    })

@app.route("/api/assign-worker", methods=["POST"])
def assign_worker():
    data = request.get_json()
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    worker_name = data.get('worker_name')
    issue_type = data.get('issue_type')
    priority = data.get('priority', 'Medium')
    
    return jsonify({
        "success": True,
        "message": f"Worker {worker_name} assigned to {issue_type} at location ({latitude}, {longitude}) with {priority} priority"
    })

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)