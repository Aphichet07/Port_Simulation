from fastapi import FastAPI
from app.api.routes import chat

app = FastAPI()

app.include_router(chat.router, prefix='/ai/chat', tags=['Chat System'])

@app.get('/')
def read_root():
    return {"message": "Hello"}