FROM python:3.11-slim-bullseye

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies (using slightly more robust base image for ML)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy all model files and the Flask application
COPY . .

# Ensure the models directory exists
RUN mkdir -p /app/models

# Expose the Flask AI API port
EXPOSE 5000

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py

# Health check
HEALTHCHECK --interval=60s --timeout=5s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the Flask server
CMD ["python", "app.py"]
