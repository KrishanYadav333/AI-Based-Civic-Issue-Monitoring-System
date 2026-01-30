FROM python:3.12.8-slim

WORKDIR /app

# Install system dependencies for OpenCV and YOLOv8
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libfontconfig1 \
    libice6 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Python dependencies (AI + Robot services)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy AI service code
COPY src/ ./src/
COPY models/ ./models/

# Copy Robot service code
COPY robot-service/ ./robot-service/

# Create directories
RUN mkdir -p temp uploads logs robot-service/static/uploads robot-service/static/results

# Create non-root user for security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Expose both ports
EXPOSE 5000 5001
ENV AI_PORT=5000
ENV ROBOT_PORT=5001

# Copy startup script
COPY start-services.sh /app/start-services.sh
USER root
RUN chmod +x /app/start-services.sh
USER appuser

# Start both services
CMD ["/app/start-services.sh"]
