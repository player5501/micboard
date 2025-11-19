# Stage 1: Build Frontend
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Python Runtime
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (e.g., for twisted/tornado if wheels are missing)
# RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY py/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY py /app/py
COPY *.html /app/
COPY *.json /app/

# Copy built frontend assets
COPY --from=builder /app/static /app/static
COPY --from=builder /app/static/demo.html /app/demo.html

# Expose port
EXPOSE 8058

# Run the application
CMD ["python3", "py/micboard.py"]
