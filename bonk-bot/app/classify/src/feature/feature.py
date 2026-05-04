import numpy as np 
import pandas as pd
import os
import math
import sys
import warnings
import re #Regex        
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from pythainlp.tokenize import word_tokenize
from pythainlp.corpus import thai_stopwords

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
        self.stopwords = frozenset(thai_stopwords())
        
    def clean_text(self, text: str) -> str:
        """ ทำความสะอาดข้อความแบบง่ายๆ """
        if not isinstance(text, str) or not text.strip():
            raise ValueError("โปรดพิมพ์ข้อความ")
        # ดักจับชื่อหุ้นภาษาอังกฤษตัวพิมพ์ใหญ่ก่อน (ต้องทำก่อน .lower() เพราะถ้า lower แล้ว A-Z จะหาไม่เจอ)
        text = re.sub(r'\b[A-Z]{2,4}\b', ' <STOCK> ', text)
        text = text.lower()
        # เก็บไว้แค่ ก-ฮ, a-z, 0-9 
        text = re.sub(r'[^\w\sก-๙<>]', ' ', text)
        # ลบช่องว่างซ้ำ
        text = re.sub(r'\s+', ' ', text)
        # ตัดคำ
        word = word_tokenize(text, engine='newmm')
        # ลบ stopword
        clean_word = [w for w in word if w not in self.stopwords and w.strip()]
        # ต่อคำ
        final_text = ' '.join(clean_word)
        return final_text
    
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
    
