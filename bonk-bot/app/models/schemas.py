from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

# def chatRequest(BaseModel):
#     userId: int
#     chat: str
    
def chatResponse(BaseModel):
    reply: str
    source: str = 'gemini'