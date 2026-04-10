# 📈 Quant-Port Simulation & AI Financial Agent

**The Intelligent Financial Analysis & Portfolio Simulation Platform** แพลตฟอร์มวิเคราะห์ข้อมูลทางการเงินและการจำลองพอร์ตการลงทุนแบบครบวงจร ขับเคลื่อนด้วยเอนจินการคำนวณความเร็วสูง (Bun) ผสานกับผู้ช่วย AI อัจฉริยะ (Gemini + LangChain) ที่สามารถค้นหาข้อมูลเรียลไทม์และวิเคราะห์สภาวะตลาดได้อย่างแม่นยำ

---

## 🏗️ System Architecture (Microservices)

โปรเจกต์นี้ถูกออกแบบด้วยสถาปัตยกรรมแบบแยกส่วน (Decoupled) เพื่อประสิทธิภาพและความยืดหยุ่นสูงสุด:

1. **Core Quant Engine (TypeScript / Bun / ElysiaJS):** รับผิดชอบการดึงข้อมูลและคำนวณโมเดลทางคณิตศาสตร์ที่ต้องการความเร็วสูง
2. **AI Financial Agent (Python / FastAPI / LangChain):** รับผิดชอบการวิเคราะห์เชิงบริบท การตอบคำถาม และการดึงข้อมูลกระแสสังคมด้วย Tool-Calling LLM

---

## 🚀 Core Technology Stack

**Frontend / Backend Engine (Core API)**
* **Runtime:** [Bun](https://bun.sh/) (High-performance JS runtime)
* **Framework:** [ElysiaJS](https://elysiajs.com/) (Fast, Type-safe framework)
* **Numerical Engine:** [mathjs](https://mathjs.org/) (Matrix & Statistical operations)

**AI & Natural Language Engine**
* **Framework:** FastAPI & Python 3.10+
* **LLM Core:** Google Gemini 2.5 Flash
* **Orchestration:** LangChain (Tool-Calling Agent & Memory Management)

**External Data Providers**
* **Finnhub API:** ราคาหุ้น Real-time และ Fundamental Data
* **Yahoo Finance:** ข้อมูลประวัติราคาย้อนหลัง (Historical) และ ETF
* **Google Search API:** ดึงกระแสสังคมและข่าวสารแบบ Real-time

---

## ✨ Features Breakdown

### 📊 Analytical Quant Engine
ระบบคำนวณผลตอบแทนและความเสี่ยงมาตรฐานระดับมืออาชีพ:
* **Returns Analysis:** Total Return, CAGR, Annualized Return, Rolling Returns
* **Risk-Adjusted Metrics:** Sharpe Ratio, Sortino Ratio, Calmar Ratio
* **Portfolio Mathematics:** Correlation Matrix, Covariance Matrix, Asset Contribution to Risk (ACTR)
* **Drawdown Analysis:** ประเมินค่าขาดทุนสูงสุด (Max Drawdown)

### 🤖 Autonomous AI Agent
ผู้ช่วย AI ที่ถูกออกแบบมาอย่างดี:
* **🧠 Brain (Reasoning):** ใช้ Gemini + LangChain ในการคิด วิเคราะห์ และวางแผนการเรียกใช้ Tools อัตโนมัติ
* **🦾 Limbs (Tool-calling):** ตัดสินใจดึงข้อมูล API หุ้น (Finnhub) หรือค้นหาข่าว (Google Search) ได้เองตามบริบทของคำถาม
* **💭 Memory (Context-Aware):** มีระบบ Session History ทำให้สามารถสนทนาต่อเนื่องและจำบริบทการลงทุนของผู้ใช้ได้
* **🛡️ Shield (Resilience):** มีระบบดัก Error และ Retry อัตโนมัติ (เช่น โควต้า API เต็ม หรือ Timeout) เพื่อป้องกันระบบล่ม

### ⚡ Real-time Market Data
* **Dual-Source Integration:** สลับแหล่งข้อมูลอัตโนมัติ (Finnhub/Yahoo) เพื่อประสิทธิภาพสูงสุด
* **WebSocket Stream:** รับข้อมูลราคาหุ้นแบบ Real-time พร้อมระบบ Auto-cleanup จัดการ Memory

---

## 🛠️ Getting Started

### 1. Prerequisites
* ติดตั้ง [Bun](https://bun.sh/) และ [Python 3.10+](https://www.python.org/)
* ขอ API Key จาก Finnhub, Google AI Studio (Gemini) และ Google Custom Search

### 2. Setup Quant Engine (Bun/Elysia)
```bash
cd server
bun install
