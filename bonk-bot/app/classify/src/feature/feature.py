import numpy as np 
import pandas as pd
import os
import math
import sys
import warnings
import re
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer

"""
ใช้สำหรับ clean + feature enginnering ข้อมูล 
ผลลัพธ์สุดท้ายต้อง export เป็นไฟล์ csv ในโฟลเดอร์ data/processed
"""

class FeatureEngineer:
    def __init__(self):
        self.imputer = SimpleImputer(strategy='most_frequent')
        # ปรับสเกล
        self.scaler = StandardScaler()
        # แปลงข้อมูลเป็นตัวเลข
        self.encoder = LabelEncoder()
        
    def clean_text(self, text: str) -> str:
        """ ทำความสะอาดข้อความแบบง่ายๆ """
        if not isinstance(text, str):
            return ""
        text = text.lower()
        # เก็บไว้แค่ ก-ฮ, a-z, 0-9
        text = re.sub(r'[^\w\sก-๙]', ' ', text)
        return text.strip()
    
    def handleMissingValue(self, df: pd.DataFrame, column: list):
        "เติมคำว่างให้กับช่องว่างที่ระบุ"
        df[column] = self.imputer.fit_transform(df[column])
        return df
    
    def handleScale(self, df: pd.DataFrame, column: list):
        "ปรับสเกลตัวเลข"
        df[column] = self.scaler.fit_transform(df[column])
        return df
    
    def handleEncode(self, df: pd.DataFrame, column: list):
        "แปลข้อมูลตัวอักษรให้เป็นตัวเลข"
        df[column] = self.encoder.fit_transform(df[column])
        return df
    
    
if __name__ == "__main__":
    print("Hello World")
    
