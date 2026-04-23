# AI Recommendation System (Demo)

โปรเจคระบบแนะนำหุ้นที่รวมการวิเคราะห์สภาวะตลาด การเลือกหุ้นและการปรับสัดส่วนหุ้นให้เข้ากับช่วงเวลา เพื่อช่วยให้ผู้ใช้ตัดสินใจ

## 🚀 Project Overview & Architecture
โปรเจคนี้ประกอบด้วย 3 Engine หลักที่ทำงานร่วมกันคือ:

1. **Market Regime **: วิเคราะห์สภาวะตลาด (Bull, Bear, Sideways) เพื่อกำหนดกลยุทธ์หลักในขณะนั้น
2. **Stock Selection Engine**: คัดเลือกหุ้นรายตัวจากจักรวาลการลงทุนตามเงื่อนไขตลาดจาก Market Regime เช่น Growth, Value หรือ Defensive โดยเน้นตัวที่มี Risk Score ต่ำและมี Correlation กับพอร์ตเดิมน้อยที่สุด
3. **Portfolio Optimization Engine**: ใช้โมเดลคณิตศาสตร์ (เช่น Mean-Variance Optimization หรือ Sharpe Ratio Maximization) เพื่อคำนวณสัดส่วนน้ำหนักที่เหมาะสมที่สุด

---

## 📁 Project Structure
```text
recommendation-system/
├── data/               # เก็บไฟล์ข้อมูล (Raw & Processed)
│   ├── processed/      # ข้อมูลที่ถูกจัดการแล้ว
│   └── raw/            # ข้อมูลดิบ
├── notebooks/          # Jupyter Notebooks สำหรับ EDA และ Model Prototyping
├── src/                # Source Code หลัก
│   ├── data_pipeline/  # ส่วนการดึงและเตรียมข้อมูล
│   ├── recommender/    # หัวใจของระบบ (3 Engines)
│   └── utils/          # ฟังก์ชันเสริมและ Helper ต่างๆ
├── .env                # เก็บ API Keys และ Configurations
├── main.py             # จุดเริ่มต้นการรันโปรแกรม
└── requirements.txt    # รายการ Library ที่จำเป็น
```

## Tech Stack:
* Language: Python 3.10+
* Core Libraries: Pandas, NumPy, Scikit-learn
* Finance Tools: PyPortfolioOpt (Optimization), Yfinance / Alpaca API

## Installation & Setup:
1. Clone Repository:
    ```bash
    git clone [https://github.com/your-username/recommendation-system.git](https://github.com/your-username/recommendation-system.git)
    cd recommendation-system
    ```
2. Environment Setup:
   ```bash
    python -m venv venv
    .\venv\Scripts\activate

   ```
3. Install Dependencies:
    ```bash
    pip install -r requirements.txt
    ```