from fastapi import FastAPI
from app.api.routes import chat
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat.router, prefix='/ai/chat', tags=['Chat System'])

@app.get('/')
def read_root():
    return {"message": "Hello"}