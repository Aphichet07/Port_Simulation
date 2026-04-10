```
bonk-bot/
├── app/                        # โค้ดหลักของระบบทั้งหมด
│   ├── api/                    # 1️ส่วน API Gateway 
│   │   ├── routes/             # แยก Endpoint ตามหมวดหมู่ (เช่น chat.py, news.py)
│   │   └── main.py             # จุดเริ่มต้นรันเซิร์ฟเวอร์ FastAPI
│   │
│   ├── ai/                     # ส่วน AI & RAG Engine
│   │   ├── agents/             # โลจิกการตัดสินใจของ LLM
│   │   ├── prompts/            # เก็บ Prompt templates แยกไว้แก้ง่ายๆ
│   │   ├── rag/                # โลจิกการทำ Embedding และค้นหาใน Vector DB
│   │   └── tools/              # เครื่องมือให้ Agent ใช้ (เช่น search_finnhub.py)
│   │
│   ├── worker/                 # ส่วน Data Ingestion
│   │   ├── scrapers/           # โค้ดไปดูดข่าว/ดึง API ของ RKLB
│   │   ├── tasks.py            # กำหนดงานที่จะให้ Celery หรือ Background task ทำ
│   │   └── scheduler.py        # ตัวตั้งเวลา (Cron jobs)
│   │
│   ├── core/                   # ส่วนตั้งค่าและระบบแกนกลาง
│   │   ├── config.py           # โหลดค่าตัวแปรจาก .env (เช่น OPENAI_API_KEY)
│   │   └── database.py         # โค้ดเชื่อมต่อ Database และ Vector DB
│   │
│   └── models/                 # รูปแบบข้อมูล
│       ├── schemas.py          # Pydantic models (เช็ค Data ขาเข้า/ขาออก API)
│       └── domain.py           # SQLAlchemy/SQLModel (ตารางใน Database)
│
├── data/                       # โฟลเดอร์เก็บไฟล์ชั่วคราว (เช่น ไฟล์ SQLite หรือ Vector DB แบบ Local)
├── tests/                      # โค้ดสำหรับทำ Unit Test
├── .env                        # ไฟล์เก็บความลับ (API Key, DB Password) - ห้ามเอาลง Git
├── .gitignore
├── docker-compose.yml          # ไฟล์ตั้งค่าสำหรับรัน Database/Redis แบบง่ายๆ
├── Dockerfile                  # สำหรับแพ็กโค้ดเราขึ้น Server
├── requirements.txt            # ไฟล์รวม Library ที่ต้องใช้ (หรือใช้ pyproject.toml ถ้าใช้ Poetry/UV)
└── README.md
```