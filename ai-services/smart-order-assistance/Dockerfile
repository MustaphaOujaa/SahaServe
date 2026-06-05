FROM python:3.11-slim

WORKDIR /app

# Install dependencies directly
RUN pip install --no-cache-dir fastapi uvicorn python-dotenv requests

# Copy the api folder contents to /app
COPY api/ /app/

EXPOSE 5005

# Run the app
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5005"]
