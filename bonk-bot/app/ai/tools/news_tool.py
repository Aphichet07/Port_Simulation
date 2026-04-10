from langchain.tools import tool
from datetime import datetime, timedelta
import os
import requests
from bs4 import BeautifulSoup
from app.core.config import settings


class NewsTools:
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
        
    @tool
    def get_stock_quote(symbol: str) -> str:
        """
        ใช้เครื่องมือนี้เมื่อต้องการทราบ 'ราคาหุ้นปัจจุบัน', 'ราคาเปิด/ปิด', 
        หรือ 'การเปลี่ยนแปลงของราคา' ของหุ้นตัวนั้นๆ (เช่น AAPL, TSLA)
        """
        api_key = os.getenv("FINNHUB_API_KEY")
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol.upper()}&token={api_key}"
        
        try:
            response = requests.get(url)
            data = response.json()
            
            if not data or data.get('c') == 0:
                return f"ไม่พบข้อมูลราคาสำหรับหุ้น {symbol}"
                
            return (
                f"ข้อมูลราคาหุ้น {symbol.upper()}:\n"
                f"- ราคาปัจจุบัน: {data['c']}\n"
                f"- การเปลี่ยนแปลง: {data['d']} ({data['dp']}%)\n"
                f"- ราคาสูงสุดของวันนี้: {data['h']}\n"
                f"- ราคาต่ำสุดของวันนี้: {data['l']}"
            )
        except Exception as e:
            return f"ระบบดึงราคาหุ้นขัดข้อง: {str(e)}"
        
    @tool
    def scrape_website_content(url: str) -> str:
        """
        ใช้เครื่องมือนี้เมื่อได้ 'ลิงก์ข่าว' หรือ 'URL' มาแล้วต้องการอ่านเนื้อหาข้างในแบบละเอียด
        เพื่อนำมาสรุปหรือวิเคราะห์ข้อมูลที่ลึกกว่าแค่พาดหัวข่าว
        """
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.encoding = 'utf-8'
            
            if response.status_code != 200:
                return f"ไม่สามารถเข้าถึงเว็บไซต์ได้ (Status Code: {response.status_code})"

            soup = BeautifulSoup(response.text, 'html.parser')

            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'ins']):
                element.decompose()

            paragraphs = soup.find_all(['p', 'h1', 'h2', 'h3'])
            text_content = "\n".join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 20])

            if len(text_content) > 3000:
                text_content = text_content[:3000] + "...\n(เนื้อหาถูกตัดให้สั้นลงเพื่อความกระชับ)"

            return f"เนื้อหาจากเว็บไซต์ {url}:\n\n{text_content}"

        except Exception as e:
            return f"เกิดข้อผิดพลาดในการดึงข้อมูลจากเว็บไซต์: {str(e)}"
        
    def get_tools(self) -> list:
        """
        รวบรวมเครื่องมือทั้งหมดในคลาสนี้
        """
        return [self.search_google, self.search_finance_api,self.get_stock_quote, self.scrape_website_content]