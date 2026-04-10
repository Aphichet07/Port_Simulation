from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

class UserSession(BaseModel):
    userId: int
    username: str
    chat_history: List[BaseMessage] = Field(default_factory=list)

    class Config:
        arbitrary_types_allowed = True

    def add_human_message(self, text: str):
        self.chat_history.append(HumanMessage(content=text))
        
    def add_ai_message(self, text: str):
        self.chat_history.append(AIMessage(content=text))

class ChatRequest(BaseModel):
    userId: int   
    username: Optional[str] = "User"
    message: str

class ChatResponse(BaseModel):
    reply: str
    source: str = 'gemini'