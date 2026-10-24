FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for compiling packages and postgresql client
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY . .

# Ensure uploads directory exists
RUN mkdir -p /app/uploads/resumes

EXPOSE 8000

# Run database migrations and start server
CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
