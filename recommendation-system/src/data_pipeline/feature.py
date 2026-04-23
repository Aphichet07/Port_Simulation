#utilities library
import numpy as np
import pandas as pd
import scipy 
import datetime
import os
import warnings
from pathlib import Path

#Feature Engineering Library
from sklearn.preprocessing import QuantileTransformer, StandardScaler, LabelEncoder

warnings.filterwarnings('ignore')


import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

class FeatureEngineering():
    def __init__(self):
        BASE_DIR = Path(__file__).resolve().parent
        self.ROOT = BASE_DIR.parent.parent / "data" / "raw" / "optimuzation_portfolio.csv"
        self.df = pd.read_csv(self.ROOT)
        
        self.df['Date'] = pd.to_datetime(self.df['Date'])
        
        self.df_processed = None
        self.cols = self.df.columns
        
    def feature_EN(self):
        """สร้างฟีเจอร์ใหม่ ก่อนนำไป Clean"""
        print("กำลังสร้าง Features ใหม่...")
        df = self.df.sort_values(by=['Ticker', 'Date']).copy()
        
        # ผลตอบแทนรายวัน ใช้ทำ Risk Optimization
        df['Daily_Return'] = df.groupby('Ticker')['Close'].pct_change()
        
        # ความผันผวนย้อนหลัง 20 วัน แปลงเป็นรายปี
        df['Volatility_20D'] = df.groupby('Ticker')['Daily_Return'].transform(
            lambda x: x.rolling(window=20).std() * np.sqrt(252)
        )
        
        # เส้นค่าเฉลี่ย 50 วัน เทรนด์
        df['SMA_50'] = df.groupby('Ticker')['Close'].transform(lambda x: x.rolling(window=50).mean())
        
        self.df_processed = df
        return self.df_processed

    def handle_missing(self):
        """จัดการข้อมูลที่ขาดหาย (Missing Values)"""
        print("🧹 กำลังจัดการ Missing Values...")
        
        self.df_processed = self.df_processed.sort_values(['Ticker', 'Date'])
        
        fill_cols = [c for c in self.df_processed.columns if c != 'Ticker']
        self.df_processed[fill_cols] = self.df_processed.groupby('Ticker')[fill_cols].ffill()
        
        if 'Ticker' not in self.df_processed.columns:
            self.df_processed.reset_index(inplace=True)
        
        num_cols = self.df_processed.select_dtypes(include=[np.number]).columns
        self.df_processed[num_cols] = self.df_processed[num_cols].fillna(self.df_processed[num_cols].median())
        self.df_processed.dropna(subset=['Close', 'Daily_Return'], inplace=True)
        
        return self.df_processed
    
    def handle_encoding(self):
        """แปลงข้อมูลตัวอักษรเป็นตัวเลข"""
        print("กำลังทำ One-Hot Encoding ...")
        # แปลง Sector เป็นตัวเลข 0, 1 (เช่น Sector_Technology, Sector_Healthcare)
        if 'Sector' in self.df_processed.columns:
            self.df_processed = pd.get_dummies(self.df_processed, columns=['Sector'], dummy_na=False, dtype=int)
            
        if 'Industry' in self.df_processed.columns:
            self.df_processed.drop(columns=['Industry'], inplace=True)
            
        return self.df_processed
    
    def handle_scaling(self):
        """ปรับสเกลข้อมูลแบบแก้ปัญหา Outlier ของข้อมูลการเงิน"""
        print("⚖️ กำลังปรับ Scale และกำจัด Outlier ด้วย QuantileTransformer...")
        
        scale_cols = ['PE_Ratio', 'Forward_PE', 'PBV_Ratio', 'Beta', 'ROE', 'Debt_to_Equity']
        scale_cols = [c for c in scale_cols if c in self.df_processed.columns]
        
        if scale_cols:
            for col in scale_cols:
                lower_bound = self.df_processed[col].quantile(0.05)
                upper_bound = self.df_processed[col].quantile(0.95)
                self.df_processed[col] = self.df_processed[col].clip(lower=lower_bound, upper=upper_bound)
            
            scaler = QuantileTransformer(output_distribution='normal', n_quantiles=300, random_state=42)
            
            self.df_processed[scale_cols] = scaler.fit_transform(self.df_processed[scale_cols])
            
        return self.df_processed
    
    def pipeline(self):
        """รันกระบวนการทั้งหมดตามลำดับ"""
        print("=== เริ่มต้น Feature Engineering Pipeline ===")
        self.feature_EN()
        self.handle_missing()
        self.handle_encoding()
        self.handle_scaling()
        print("=== เสร็จ ===")
        return self.df_processed
    
    
    def recommendation_data(self, output: str):
        """ดึงเฉพาะข้อมูล Snapshot ล่าสุดของหุ้นแต่ละตัวเพื่อไปทำ Clustering"""
        df_rec = self.df_processed.drop_duplicates(subset=['Ticker'], keep='last').copy()
        
        drop_cols = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Daily_Return', 'SMA_50']
        df_rec.drop(columns=[c for c in drop_cols if c in df_rec.columns], inplace=True)
        
        df_rec.to_csv(output, index=False)
        print(f"Recommendation Data เสร็จ -> {output}")
        return df_rec
    
    def forecast_data(self, output: str):
        """ดึงข้อมูล Time-series เพื่อทำนายแนวโน้ม (Context / Macro)"""
        cols = ['Date', 'Ticker', 'Close', 'Volume', 'Daily_Return', 'VIX_Index', 'GDP_Growth', 'CPI_Inflation', 'Policy_Rate']
        cols = [c for c in cols if c in self.df_processed.columns]
        
        df_fc = self.df_processed[cols]
        df_fc.to_csv(output, index=False)
        print(f"Forecast Data เสร็จ -> {output}")
        return df_fc
    
    def risk_data(self, output: str):
        """สร้างตารางผลตอบแทนรายวัน (Pivot Table) สำหรับ Portfolio Optimization"""
        df_risk = self.df_processed.pivot(index='Date', columns='Ticker', values='Daily_Return')
        
        df_risk.dropna(inplace=True) 
        
        df_risk.to_csv(output, index=False)
        print(f"Risk Data เสร็จ -> {output}")
        return df_risk

if __name__ == "__main__":
    output_dir = Path("data/processed")
    output_dir.mkdir(parents=True, exist_ok=True)
    fe = FeatureEngineering()
    processed_df = fe.pipeline()
    
    fe.recommendation_data(output_dir / "recommendation_features.csv")
    fe.forecast_data(output_dir / "forecast_features.csv")
    fe.risk_data(output_dir / "risk_returns.csv")
    