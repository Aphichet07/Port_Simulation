# server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.11. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

```
server/
├── bun.lockb                  # ไฟล์จัดการเวอร์ชันของ Package (สร้างโดย Bun)
├── package.json
├── tsconfig.json              # ตั้งค่า TypeScript
├── drizzle.config.ts          # ตั้งค่าการรัน Migration ของ Drizzle
├── .env                       # เก็บ Secret Keys (DB_URL, API_KEYS)
│
└── src/
    ├── index.ts               # Entry Point หลัก: รวมทุก Modules และ Start Server
    ├── setup.ts               # ตั้งค่า Global (CORS, Error Handler, Logger)
    │
    ├── db/                    # Database Layer (Drizzle)
    │   ├── index.ts           # สร้าง Connection ด้วย postgres.js
    │   ├── schema.ts          # ไฟล์เก็บ Schema หลักทั้งหมด (Users, Transactions, Assets)
    │   ├── migrate.ts         # สคริปต์สำหรับรัน Database Migration
    │   └── seed.ts            # สคริปต์จำลองข้อมูลเริ่มต้น (เช่น ข้อมูลหุ้น Mockup)
    │
    ├── common/                # Shared Resources (ใช้ร่วมกันทั้งโปรเจกต์)
    │   ├── middlewares/       # เช่น authMiddleware (ตรวจสอบ JWT)
    │   ├── types/             # Global TypeScript Interfaces (เช่น JwtPayload)
    │   ├── errors/            # Custom Error Classes (เช่น InsufficientFundError)
    │   └── utils/             # ฟังก์ชันช่วยเหลือทั่วไป (FormatDate, ParseCurrency)
    │
    └── modules/               # FEATURE-DRIVEN DOMAINS (หัวใจหลักของระบบ)
        │
        ├── auth/              # Feature: การยืนยันตัวตน
        │   ├── index.ts       # Route: POST /auth/login, POST /auth/register
        │   ├── service.ts     # Logic: Hash Password, Sign JWT
        │   └── schema.ts      # Elysia Type Validation (t.Object)
        │
        ├── market/            # Feature: ดึงข้อมูลตลาดหุ้น/ทอง/ETF
        │   ├── index.ts       # Route & WebSocket Setup (/ws/market)
        │   ├── service.ts     # Logic: ดึงข้อมูลจาก API ภายนอก (Finnhub, Yahoo)
        │   ├── ws-handler.ts  # Logic: จัดการการ Broadcast ข้อมูล WebSocket
        │   └── schema.ts      # Validation: ตรวจสอบ Symbol Format
        │
        ├── portfolio/         # Feature: จัดการพอร์ตและคำสั่งซื้อขาย
        │   ├── index.ts       # Route: POST /portfolio/trade, GET /portfolio/summary
        │   ├── service.ts     # Logic: คำนวณหักเงินบัญชี, บันทึกประวัติ
        │   └── schema.ts      # Validation: OrderType (BUY/SELL), จำนวนเงิน
        │
        ├── quant/             # Feature: สมการและโมเดลทางการเงิน
        │   ├── index.ts       # Route: GET /quant/var, GET /quant/monte-carlo
        │   ├── service.ts     # Logic: จัดเตรียมข้อมูลก่อนส่งเข้าโมเดลคำนวณ
        │   ├── math/          # การเขียนสมการ "From Scratch"
        │   │   ├── stats.ts   # คำนวณ Standard Deviation, Variance, Mean
        │   │   ├── gbm.ts     # อัลกอริทึม Geometric Brownian Motion (Monte Carlo)
        │   │   └── risk.ts    # คำนวณ Value at Risk (VaR), Sharpe Ratio
        │   └── backtest/      # Engine สำหรับจำลองกลยุทธ์ย้อนหลัง
        │       └── engine.ts  # Logic ดัน historical data เข้าเงื่อนไขการเทรด
        │
        └── ai-assistant/      # Feature: ระบบวิเคราะห์ข่าวและแชตกับพอร์ต
            ├── index.ts       # Route: POST /ai/ask, GET /ai/sentiment
            ├── service.ts     # Logic: ส่งข้อมูลหา LLM
            └── rag.ts         # Logic: ค้นหาข่าวที่เกี่ยวข้อง (Vector Search)
```