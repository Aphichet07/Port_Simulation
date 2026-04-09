FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk.py .
COPY entrypoint.py .

# user_script.py จะถูก mount ตอน docker run
CMD ["python", "entrypoint.py"]
