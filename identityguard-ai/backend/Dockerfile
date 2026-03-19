FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV and deepface
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories for local storage and SQLite
RUN mkdir -p /app/data /app/faces /app/data/temp

# Copy application source
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# By default, expose FastAPI port
EXPOSE 8000
EXPOSE 9000

# Default command (can be overridden in docker-compose.yml)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
