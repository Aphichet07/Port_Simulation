from langchain.tools import tool
from datetime import datetime, timedelta
import os
import requests
from bs4 import BeautifulSoup
from app.core.config import settings

@tool
def search_google(query: str) -> str:
    """
    ใช้เครื่องมือนี้เมื่อต้องการค้นหาข้อมูลทั่วไป, บทความ, หรือข่าวสารกว้างๆ บน Google
    เหมาะสำหรับคำถามที่ต้องการรู้ 'กระแส' หรือ 'สถานการณ์ปัจจุบัน'
    """
    url = "https://google.serper.dev/search"
    payload = {
        "q": query,
        "gl": "th", 
        "hl": "th"  
    }
    headers = {
        'X-API-KEY': os.getenv("SERPER_API_KEY"),
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()
        
        results = data.get("organic", [])[:3]
        if not results:
            return "ไม่พบข้อมูลบน Google"
            
        formatted_result = f"ผลการค้นหา Google สำหรับ '{query}':\n"
        for res in results:
            formatted_result += f"- {res.get('title')}: {res.get('snippet')} (ที่มา: {res.get('link')})\n"
            
        return formatted_result
    except Exception as e:
        return f"ระบบค้นหา Google ขัดข้อง: {str(e)}"
    
@tool
def search_finance_api(symbol: str) -> str:
    """
    ใช้เครื่องมือนี้เมื่อผู้ใช้ถามหา 'ข่าวของบริษัท' หรือ 'ข่าวหุ้น' แบบเจาะจง (เช่น RKLB, AAPL)
    ให้ใส่ symbol เป็นตัวย่อหุ้นภาษาอังกฤษเสมอ
    """
    api_key = os.getenv("FINNHUB_API_KEY")
    
    today = datetime.today().strftime('%Y-%m-%d')
    last_week = (datetime.today() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={last_week}&to={today}&token={api_key}"
    
    try:
        response = requests.get(url)
        news_data = response.json()
        
        if not news_data or len(news_data) == 0:
            return f"ไม่มีประกาศหรือข่าวทางการของ {symbol} ในช่วง 7 วันที่ผ่านมา"
            
        formatted_result = f"ข่าวทางการของบริษัท {symbol} (ข้อมูลจาก API):\n"
        for news in news_data[:3]:
            date_str = datetime.fromtimestamp(news['datetime']).strftime('%Y-%m-%d')
            formatted_result += f"- [{date_str}] {news['headline']}\n  สรุป: {news['summary']}\n  ลิงก์: {news['url']}\n"
            
        return formatted_result
    except Exception as e:
        return f"ระบบดึงข่าว API ขัดข้อง: {str(e)}"