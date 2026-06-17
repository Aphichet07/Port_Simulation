# 📚 ข้อมูลของโปรเจค Portfolio Simulation เรื่องราว

## เรื่องเล่าของการออกแบบ Database

ลองนึกภาพ... 👤

**User** (ผู้ใช้) เข้ามาในระบบ เขาต้องการสร้าง **Portfolio** (พอร์ต) ของเขา เช่น "Portfolio ฝึกปี 2" 

ใน Portfolio นั้น ผู้ใช้อยากเทรดหลายๆ สินค้า เช่น ซื้อ Apple Stock, ซื้อ Bitcoin, ขายทอง เป็นต้น 📊

---

## เรื่องราวการซื้อขาย

**สมมติว่าวันนี้ส่ง Order**
1. ผู้ใช้ "สั่งซื้อ Apple (AAPL) 10 หุ้น ที่ราคา 150 เหรียญต่อหุ้น" 
   → ข้อมูลนี้บันทึกใน **Orders table**

2. Order ถูกประมวล (Execute) 
   → ถูกบันทึกใน **Transactions table** (พร้อม timestamp ว่าซื้อเมื่อไร)

3. ผู้ใช้ตอนนี้เป็นเจ้าของ Apple 10 หุ้น 
   → บันทึกใน **Positions table** (ตำแหน่งที่ถืออยู่ปัจจุบัน)

4. เงินของพอร์ตลดลง 1,500 เหรียญ 
   → ลด **cashBalance** ใน Portfolios table

---

## ทำไมถึงแยก Transactions กับ Positions?

เพราะว่า...

- **Transactions** = เก็บประวัติ "เคยซื้อ/ขายอะไรบ้าง"
- **Positions** = เก็บ "ตอนนี้ถืออะไรอยู่"

ถ้าผู้ใช้ซื้อ Bitcoin แล้วขายมัน Transactions จะมี 2 record แต่ Position ของ Bitcoin จะหายไป (quantity = 0)

---

## ความสัมพันธ์ระหว่างตาราง

```
👤 User 
  ↓ เมื่อสร้าง Portfolio
💼 Portfolio (ฝึกปี 2, เงินสด 100,000)
  ↓ Portfolio มีหลายสินค้า
📊 Portfolio_Assets (น้ำหนัก 40% Apple, 60% Bitcoin)
  ↓ และจะมีประวัติ
📈 Transactions (ซื้อขายที่ผ่านมา)
📉 Positions (ตำแหน่งปัจจุบัน)
📋 Orders (คำสั่งซื้อ-ขายทั้งหมด)

📦 Assets (ข้อมูลสินค้า Apple, Bitcoin, Gold...)
  ↓ Asset ต้องมีข้อมูล
    - สัญลักษณ์ (AAPL, BTC)
    - ประเภท (Stock, Crypto)
    - ตลาด (SET, BINANCE)
```

---

## ทำไมถึงต้อง Normalize?

มาดูตัวอย่างไม่ normalize บ้าง:

❌ **ไม่ normalize** - เก็บ "Apple" เป็นข้อความเยอะๆ
```
Orders { ....... "AAPL", "AAPL", "AAPL" ...... }
```
→ ถ้าอยากเปลี่ยน "AAPL" เป็น "APP" ต้องแก้ทุกที่

✅ **Normalize** - เก็บแค่ ID
```
Orders { ........ assetId: 1, assetId: 1, assetId: 1 ........ }
Assets { 1: { symbol: "AAPL", name: "Apple" } }
```
→ เปลี่ยนแค่ที่เดียว

---

## ลำดับชั้นของ Normalization

### 📍 **1NF - First Normal Form** (ข้อมูลต้องเป็นค่าเดี่ยว)

**ปัญหา ❌**: 
```
Orders Table
┌────┬──────────┬─────────────────────────┐
│ id │ userId   │ assets                  │
├────┼──────────┼─────────────────────────┤
│ 1  │ user123  │ AAPL, BTC, GOLD         │ ← array ในใจน้อย column!
└────┴──────────┴─────────────────────────┘
```
→ ถ้าหา Order ของ AAPL ยากมาก

**แก้ ✅**:
```
OrderItems Table
┌────┬───────────┬─────────┐
│ id │ orderId   │ asset   │
├────┼───────────┼─────────┤
│ 1  │ 1         │ AAPL    │
│ 2  │ 1         │ BTC     │
│ 3  │ 1         │ GOLD    │
└────┴───────────┴─────────┘
```
→ แต่ละ row มีค่าเดี่ยว ไม่มี array!

---

### 📍 **2NF - Second Normal Form** (ไม่ซ้ำซ้อน)

**ปัญหา ❌**:
```
Orders Table
┌────┬────────┬──────────┬─────────────────┐
│ id │ assetId│ assetName│ price           │
├────┼────────┼──────────┼─────────────────┤
│ 1  │ 1      │ Apple    │ 150             │
│ 2  │ 1      │ Apple    │ 150             │ ← ซ้ำ!
│ 3  │ 2      │ Bitcoin  │ 45000           │
│ 4  │ 2      │ Bitcoin  │ 45000           │ ← ซ้ำ!
└────┴────────┴──────────┴─────────────────┘
```
→ ชื่อและราคา Asset ถูกเก็บเพิ่มเติม (ขึ้นอยู่กับ assetId ไม่ใช่ id)

**แก้ ✅**:
```
Assets Table                    Orders Table
┌────┬──────────┬────────┐      ┌────┬────────┐
│ id │ name     │ price  │      │ id │ assetId│
├────┼──────────┼────────┤      ├────┼────────┤
│ 1  │ Apple    │ 150    │ ←─── │ 1  │ 1      │
│ 2  │ Bitcoin  │ 45000  │ ←─── │ 2  │ 1      │
└────┴──────────┴────────┘      │ 3  │ 2      │
                                │ 4  │ 2      │
                                └────┴────────┘
```
→ แต่ละ table มีความรับผิดชอบเดียว!

---

### 📍 **3NF - Third Normal Form** (ไม่มี chain dependency)

**ปัญหา ❌**:
```
Positions Table
┌────┬────────┬──────────┬────────────────────┐
│ id │ assetId│ assetName│ exchangeName       │
├────┼────────┼──────────┼────────────────────┤
│ 1  │ 1      │ Apple    │ NASDAQ             │ ← ชื่อ depend บน assetId
│ 2  │ 2      │ Bitcoin  │ Crypto Exchange    │ ← ชื่อ depend บน assetId
└────┴────────┴──────────┴────────────────────┘
```
→ Asset name ขึ้นอยู่กับ assetId (chain dependency: id → assetId → assetName)

**แก้ ✅**:
```
Assets Table                        Positions Table
┌────┬──────────┬────────────┐      ┌────┬────────┬──────────┐
│ id │ name     │ exchange   │      │ id │ assetId│ quantity │
├────┼──────────┼────────────┤      ├────┼────────┼──────────┤
│ 1  │ Apple    │ NASDAQ     │ ←─── │ 1  │ 1      │ 10       │
│ 2  │ Bitcoin  │ Binance    │ ←─── │ 2  │ 2      │ 0.5      │
└────┴──────────┴────────────┘      └────┴────────┴──────────┘
```
→ ข้อมูล depend เฉพาะบน Primary Key (id) เท่านั้น!

---

✅ **โปรเจคนี้ = 3NF** (ดีเลยหล่ะ!)

---

## ตัวอย่างสถานการณ์ใช้งาน

### สถานการณ์ที่ 1: ลบ Portfolio
```
ผู้ใช้ลบ Portfolio "ฝึกปี 2"
↓
Portfolio ถูกลบ
↓
Portfolio_Assets ที่เกี่ยวกับ Portfolio นี้ ลบโดยอัตโนมัติ (CASCADE)
↓
Transactions, Positions, Orders ยังอยู่ (เพื่อเก็บประวัติ)
```

### สถานการณ์ที่ 2: ขอดู Portfolio ทั้งหมดของ User
```
SELECT * FROM Portfolios WHERE userId = 123
```
ง่ายดายเลย! 

### สถานการณ์ที่ 3: ขอดู Assets ใน Portfolio นี้
```
SELECT Assets.* 
FROM Assets
JOIN PortfolioAssets ON Assets.id = PortfolioAssets.assetId
WHERE PortfolioAssets.portfolioId = 5
```
ใช้ Junction Table เชื่อมกัน!

---

## สรุปแบบ 1 ประโยค

**โปรเจคนี้ออกแบบ Database เพื่อให้ user สามารถสร้าง portfolio หลายชุด เทรด assets หลายประเภท โดยเก็บประวัติ transactions ทั้งหมด และตำแหน่งปัจจุบัน โดยไม่มีข้อมูลซ้ำซ้อน ผ่านการ normalize ข้อมูลตามหลัก 3NF** 

😎
