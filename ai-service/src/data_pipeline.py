import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def fetch_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    """โหลดข้อมูลหุ้นและ Flatten Multi-level columns ให้เรียบร้อย"""
    df = yf.download(ticker, start=start_date, end=end_date, auto_adjust=True)

    # --- แก้ Bug: yfinance เวอร์ชันใหม่ return Multi-level columns ---
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    return df

def scale_data(df: pd.DataFrame, feature_columns: list):
    """ปรับสเกลข้อมูลให้อยู่ระหว่าง 0 ถึง 1"""
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_features = scaler.fit_transform(df[feature_columns])
    return scaled_features, scaler

def create_sequences(scaled_data: np.ndarray, target_data: np.ndarray, window_size: int = 60):
    """
    มัดรวมข้อมูล 60 วัน (X) เพื่อจับคู่กับผลลัพธ์ของวันที่ 61 (y)
    """
    X, y = [], []
    for i in range(window_size, len(scaled_data)):
        X.append(scaled_data[i - window_size:i])
        y.append(target_data[i])

    return np.array(X), np.array(y)