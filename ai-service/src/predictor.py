import cuda_setup
cuda_setup.setup_cuda()

import datetime
import numpy as np
import joblib
import keras
from src.data_pipeline import fetch_data
from src.indicaltor import add_features
from src.config import Config
from src.news_service import NewsService

class Predictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self._load_assets()

    def _load_assets(self):
        """โหลดโมเดลและเครื่องมือต่างๆ ครั้งเดียวตอนเริ่ม Server"""
        try:
            self.model = keras.models.load_model(Config.get_model_path())
            self.scaler = joblib.load(Config.get_scaler_path())
            print("✅ Model and Scaler loaded successfully.")
        except Exception as e:
            print(f"❌ Error loading assets: {e}")

    def predict(self, ticker: str):
        if self.model is None or self.scaler is None:
            raise Exception("Model assets not loaded.")

        # 1. Fetch data
        end_date = datetime.date.today().strftime('%Y-%m-%d')
        start_date = (datetime.date.today() - datetime.timedelta(days=250)).strftime('%Y-%m-%d')
        df = fetch_data(ticker, start_date, end_date)

        # 2. Preprocess
        df = add_features(df)
        df = df.dropna()

        if len(df) < Config.WINDOW_SIZE:
            return {
                "success": False,
                "error": f"Not enough data for {ticker}. Need {Config.WINDOW_SIZE} trading days."
            }

        # 3. Preparation
        recent_data = df[Config.FEATURE_COLS].tail(Config.WINDOW_SIZE).values
        scaled_recent_data = self.scaler.transform(recent_data)
        X_latest = np.reshape(scaled_recent_data, (1, Config.WINDOW_SIZE, len(Config.FEATURE_COLS)))

        # 4. Inference (Technical Analysis)
        current_price = float(df['Close'].iloc[-1])
        prediction_prob = float(self.model.predict(X_latest, verbose=0)[0][0])
        
        # 5. Sentiment Analysis (News)
        news_sentiment = NewsService.get_news_sentiment(ticker)
        
        # 6. Hybrid Logic (ผสมกราฟกับข่าว)
        # เราจะใช้น้ำหนัก 80% กราฟ / 20% ข่าว
        # แปลง sentiment (-1 to 1) เป็นช่วง (0 to 1) 
        news_prob = (news_sentiment + 1) / 2
        hybrid_prob = (prediction_prob * 0.8) + (news_prob * 0.2)
        
        direction = "UP" if hybrid_prob > 0.5 else "DOWN"
        confidence = hybrid_prob if hybrid_prob > 0.5 else (1 - hybrid_prob)

        return {
            "success": True,
            "ticker": ticker,
            "current_price": round(current_price, 2),
            "prediction": direction,
            "confidence": round(confidence * 100, 2),
            "technical_prob": round(prediction_prob, 4),
            "news_sentiment": news_sentiment,
            "timestamp": datetime.datetime.now().isoformat()
        }

# สร้าง Instance เดียวไว้ใช้ร่วมกันทั้งแอป
predictor = Predictor()
