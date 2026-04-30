import numpy as np
import pandas as pd
import warnings
import os
from typing import List, Dict

from pathlib import Path


"""
อ่านไฟล์ csv จากนั้นเขียนแบ่ง train test ปกติ แล้วสร้า่ง object ClassifyModel ขึ้นมา

"""


class ClassifyModel:
    def __init__(self):
        """
        ใช้ สำหรับกำหนดค่า parameter 
        """
        pass
    
    def train(self, x, y, random_state=42):
        """
        ใช้ train model
        """
        
        pass
    
    def evalute(self):
        """
        ใช้สำหรับ test model
        """
        
        pass
    
    
    def printReport(self):
        """
        ใช้สำหรับแสดงผลค่าต่างๆเช่น accuracy, confustion matrix, f1 บลาๆ สำหรับวัดผลโมเดล
        """
        
        pass
    
    
if __name__ == "__main__":
    
    print("Hello")