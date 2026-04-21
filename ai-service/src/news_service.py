from textblob import TextBlob
import requests
import os
from src.config import Config

class NewsService:
    @staticmethod
    def analyze_sentiment(text: str):
        """วิเคราะห์อารมณ์ข้อความ คืนค่า -1.0 ถึง 1.0"""
        if not text:
            return 0.0
        analysis = TextBlob(text)
        # polarity คือค่าอารมณ์ (-1 ถึง 1)
        return analysis.sentiment.polarity

    @staticmethod
    def get_news_sentiment(ticker: str):
        """
        ดึงข่าวจาก Backend และคำนวณคะแนนเฉลี่ย
        เราจะลองดึงจาก Backend ที่รันอยู่ที่พอร์ต 3000 (ตามโครงสร้าง Elysia)
        """
        try:
            # สมมติว่า Backend รันอยู่ที่ localhost:3000
            # หากเครื่องอื่นอาจต้องใช้ IP ของเครื่องแทน
            url = f"http://localhost:3000/news/{ticker}?limit=5"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data", {}).get("news"):
                    news_list = data["data"]["news"]
                    total_sentiment = 0
                    count = 0
                    
                    for item in news_list:
                        headline = item.get("headline", "")
                        summary = item.get("summary", "")
                        
                        # ให้คะแนน Headline มีน้ำหนักมากกว่า Summary (ถ้ามี)
                        h_score = NewsService.analyze_sentiment(headline)
                        s_score = NewsService.analyze_sentiment(summary)
                        
                        avg_item_score = (h_score * 0.7) + (s_score * 0.3)
                        total_sentiment += avg_item_score
                        count += 1
                    
                    if count > 0:
                        return round(total_sentiment / count, 4)
            
            return 0.0 # ถ้าดึงข่าวไม่ได้ หรือไม่มีข่าว ให้เป็นกลาง (0)
        except Exception as e:
            print(f"Warning: Could not fetch news sentiment: {e}")
            return 0.0
