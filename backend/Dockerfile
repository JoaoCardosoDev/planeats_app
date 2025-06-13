FROM python:3.9-slim
WORKDIR /app
ENV PYTHONUNBUFFERED 1
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Make startup script executable (optional, can be used with docker-compose override)
RUN chmod +x startup.sh

EXPOSE 8000
# Default command - can be overridden in docker-compose for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
