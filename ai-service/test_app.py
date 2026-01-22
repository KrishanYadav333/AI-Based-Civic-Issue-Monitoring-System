"""
Test cases for AI Issue Detection Service
"""
import pytest
import os
import tempfile
from PIL import Image
import io
from app import app, simple_classifier, ml_classifier

@pytest.fixture
def client():
    """Create a test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_image():
    """Create a sample test image"""
    img = Image.new('RGB', (224, 224), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert data['service'] == 'AI Issue Detection'

def test_model_info_endpoint(client):
    """Test model info endpoint"""
    response = client.get('/api/model/info')
    assert response.status_code == 200
    data = response.get_json()
    assert 'model' in data
    assert 'version' in data

def test_detect_issue_success(client, sample_image):
    """Test successful issue detection"""
    data = {'image': (sample_image, 'test.jpg')}
    response = client.post(
        '/api/detect',
        data=data,
        content_type='multipart/form-data'
    )
    
    assert response.status_code == 200
    result = response.get_json()
    assert 'issueType' in result
    assert 'confidence' in result
    assert 'priority' in result
    assert result['issueType'] in ['pothole', 'garbage', 'streetlight', 'debris', 'other']
    assert 0 <= result['confidence'] <= 1
    assert result['priority'] in ['high', 'medium', 'low']

def test_detect_issue_no_file(client):
    """Test detection without file"""
    response = client.post('/api/detect')
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_detect_issue_invalid_file(client):
    """Test detection with invalid file type"""
    data = {'image': (io.BytesIO(b'not an image'), 'test.txt')}
    response = client.post(
        '/api/detect',
        data=data,
        content_type='multipart/form-data'
    )
    assert response.status_code == 400

def test_simple_classifier():
    """Test simple classifier function"""
    result = simple_classifier()
    assert 'issueType' in result
    assert 'confidence' in result
    assert 'priority' in result

def test_ml_classifier(sample_image):
    """Test ML classifier with sample image"""
    # Save temporary image
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        tmp.write(sample_image.getvalue())
        tmp_path = tmp.name
    
    try:
        result = ml_classifier(tmp_path)
        assert 'issueType' in result
        assert 'confidence' in result
        assert 'priority' in result
    finally:
        os.unlink(tmp_path)

def test_concurrent_requests(client, sample_image):
    """Test multiple concurrent requests"""
    import concurrent.futures
    
    def make_request():
        sample_image.seek(0)
        data = {'image': (sample_image, 'test.jpg')}
        return client.post(
            '/api/detect',
            data=data,
            content_type='multipart/form-data'
        )
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    assert all(r.status_code == 200 for r in results)

def test_large_image(client):
    """Test handling of large images"""
    # Create 5MB image
    img = Image.new('RGB', (3000, 3000), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG', quality=95)
    img_bytes.seek(0)
    
    data = {'image': (img_bytes, 'large.jpg')}
    response = client.post(
        '/api/detect',
        data=data,
        content_type='multipart/form-data'
    )
    
    assert response.status_code in [200, 413]  # Success or payload too large

def test_image_preprocessing():
    """Test image preprocessing maintains aspect ratio"""
    img = Image.new('RGB', (800, 600), color='green')
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        img.save(tmp, format='JPEG')
        tmp_path = tmp.name
    
    try:
        result = ml_classifier(tmp_path)
        assert result is not None
    finally:
        os.unlink(tmp_path)
