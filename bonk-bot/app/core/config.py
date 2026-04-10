from dotenv import load_dotenv
import os
load_dotenv()

class Settings:
    """
    คลาสสำหรับเก็บการตั้งค่าทั้งหมดของระบบ
    ข้อดีของการทำแบบนี้คือ ถ้าในอนาคตมีการเปลี่ยนชื่อตัวแปร หรือเปลี่ยนที่เก็บ
    เราจะแก้แค่ไฟล์นี้ไฟล์เดียว ไม่ต้องตามไปแก้ทุกไฟล์ในโปรเจกต์
    """
    PROJECT_NAME: str = "Bonk Bot"
    VERSION: str = "1.0.0"
    
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
    SERPER_API_KEY: str = os.getenv("SERPER_API_KEY")
    FINNHUB_API_KEY: str = os.getenv("FINNHUB_API_KEY")

settings = Settings()