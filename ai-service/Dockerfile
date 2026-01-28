FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and YOLOv8
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libfontconfig1 \
    libice6 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY models/ ./models/

# Create directories
RUN mkdir -p temp uploads logs

# Create non-root user for security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Expose port (Render will assign dynamic PORT)
EXPOSE 5000
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:' + __import__('os').getenv('PORT', '5000') + '/health').read()"

# Start FastAPI with uvicorn - bind to PORT from environment
CMD uvicorn src.main:app --host 0.0.0.0 --port $PORT
