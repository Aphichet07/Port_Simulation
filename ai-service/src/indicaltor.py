import ta
import pandas as pd

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    เพิ่ม Technical Indicators (RSI, EMA) ลงใน DataFrame
    รองรับ yfinance ที่ return Multi-level columns ด้วย
    """
    # --- แก้ Bug: yfinance เวอร์ชันใหม่ return Multi-level columns ---
    # ถ้า columns เป็นแบบ MultiIndex ให้ Flatten ให้เป็น Level เดียวก่อน
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # ดึง Close ให้แน่ใจว่าเป็น Series 1 มิติ (ไม่ใช่ DataFrame)
    close = df['Close'].squeeze()

    # 1. RSI (14 วัน)
    df['RSI'] = ta.momentum.RSIIndicator(close, window=14).rsi()

    # 2. EMA (50 วัน)
    df['EMA_50'] = ta.trend.EMAIndicator(close, window=50).ema_indicator()

    # 3. Target: ราคาพรุ่งนี้ > วันนี้ => 1 (UP), ไม่งั้น => 0 (DOWN)
    df['Target'] = (df['Close'].squeeze().shift(-1) > df['Close'].squeeze()).astype(int)

    # 4. ลบแถวที่คำนวณไม่ได้ (NaN)
    return df.dropna()