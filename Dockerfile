FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scientific packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY python-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application
COPY python-backend/ .

# Environment variable for the port
ENV PORT=5000

# Run the application
CMD ["python", "app.py"]
