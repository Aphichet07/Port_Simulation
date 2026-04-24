from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict

from src.recommender.engine import Engine

class UserPortfolio(BaseModel):
    user_portfolio: Dict[str, float] = Field(
        ..., 
        example={"ED": 0.60, "DUK": 0.20, "NVDA": 0.20}
    )
    top_n_recommendations: int = Field(default=3, ge=1)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/optimize")
def optimize_stock(request: UserPortfolio):
    pipeline = Engine()
    payload_dict = request.model_dump()
    result = pipeline.run(payload=payload_dict)
    
    return {
        "status": "success",
        "data": result
    }