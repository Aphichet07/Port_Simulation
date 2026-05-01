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
        # สร้างตัวช่วย (Transformers) เตรียมไว้
        self.imputer = SimpleImputer(strategy='most_frequent')
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
    def clean_text(self, text: str) -> str:
        """ ทำความสะอาดข้อความแบบง่ายๆ """
        if not isinstance(text, str):
            return ""
        text = text.lower()
        # เก็บไว้แค่ ก-ฮ, a-z, 0-9
        text = re.sub(r'[^\w\sก-๙]', ' ', text)
        return text.strip()
    
    def handleMissingValue(self, df: pd.DataFrame, columns: list):
        """ เติมค่าว่างให้กับคอลัมน์ที่ระบุ """
        if columns:
            df[columns] = self.imputer.fit_transform(df[columns])
        return df
    
    def handleScal(self, df: pd.DataFrame, columns: list):
        """ ปรับสเกลตัวเลขให้เป็นมาตรฐาน (Standardization) """
        if columns:
            df[columns] = self.scaler.fit_transform(df[columns])
        return df
    
    def handleEncode(self, df: pd.DataFrame, column: str):
        """ เปลี่ยนข้อมูลหมวดหมู่ (Categorical) ในคอลัมน์เดียวให้เป็นตัวเลข """
        if column in df.columns:
            df[column] = self.label_encoder.fit_transform(df[column])
        return df
    
    
if __name__ == "__main__":
    pass

