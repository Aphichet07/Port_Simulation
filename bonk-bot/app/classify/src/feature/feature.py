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
        pass
        
    def clean_text(self, text: str) -> str:
        """ ทำความสะอาดข้อความแบบง่ายๆ """
        if not isinstance(text, str):
            return ""
        text = text.lower()
        # เก็บไว้แค่ ก-ฮ, a-z, 0-9
        text = re.sub(r'[^\w\sก-๙]', ' ', text)
        return text.strip()
    
    def handleMissingValue():
        pass
    
    def handleScal(self):
        pass
    
    def handleEncode(self):
        pass
    
    
if __name__ == "__main__":
    pass

