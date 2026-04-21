from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.predictor import predictor
import uvicorn

# 1. สร้าง FastAPI App
app = FastAPI(
    title="AI Stock Prediction API",
    description="API สำหรับทำนายแนวโน้มราคาหุ้นรายวันด้วยโมเดล LSTM",
    version="1.0.0"
)

# 2. กำหนด Schema สำหรับรับข้อมูล (Request Body)
class PredictionRequest(BaseModel):
    ticker: str

# 3. สร้าง Endpoint สำหรับทำนายผล
@app.post("/predict")
async def get_prediction(request: PredictionRequest):
    ticker = request.ticker.upper()
    
    try:
        result = predictor.predict(ticker)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. หน้าแรก (Health Check)
@app.get("/")
def home():
    return {"message": "AI Prediction Server is running!", "docs": "/docs"}

# 5. สั่งรัน Server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
