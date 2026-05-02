import numpy as np
import pandas as pd
import warnings
import os
from typing import List, Dict

from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier
import pickle

"""
อ่านไฟล์ csv จากนั้นเขียนแบ่ง train test ปกติ แล้วสร้าง object ClassifyModel ขึ้นมา
"""


class ClassifyModel:
    def __init__(self):
        """
        ใช้ สำหรับกำหนดค่า parameter 
        """
        # ใช้ char_wb เพื่ออ่านเป็นกลุ่มตัวอักษรแก้ปัญหาคำพิมพ์ผิด, min_df=2 ตัดคำแปลกๆ ทิ้ง, max_df=0.9 ตัดคำเกร่อๆ ทิ้ง
        self.vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 4), min_df=2, max_df=0.9)
        self.model = CatBoostClassifier(iterations=300, learning_rate=0.1, depth=6, verbose=False, random_state=42)
        self.is_loaded = False
        
        # ตั้งค่า Path สำหรับเซฟ/โหลดโมเดล
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.models_dir = os.path.join(self.base_dir, 'models')
        self.model_path = os.path.join(self.models_dir, 'model_class.pkl')
        self.vec_path = os.path.join(self.models_dir, 'vectorizer.pkl')
        
    def load(self):
        """
        โหลดโมเดลที่เซฟไว้ขึ้นมา
        """
        if os.path.exists(self.model_path) and os.path.exists(self.vec_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(self.vec_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            self.is_loaded = True
        else:
            print("Can't find model.")
    def train(self, x, y):
        """
        ใช้ train model ด้วย CatBoost
        """
        # แปลง Text เป็นตัวเลข
        x_vec = self.vectorizer.fit_transform(x)
        
        print("Trainning...")
        self.model.fit(x_vec, y)
        print("Trainning completed! Model is ready to use")
        
        # เซฟโมเดล
        self.saveModel()
            

    def evaluate(self, x_test):
        """
        ใช้สำหรับ test model
        """
        x_vec = self.vectorizer.transform(x_test)
        return self.model.predict(x_vec)
        
    def predict(self, clean_text: str) -> int:
        """
        รับข้อความที่ผ่านการ Clean แล้ว 1 ประโยค แล้วทำนายเป็น 0 หรือ 1
        """
        if not self.is_loaded:
            self.load()
            
        x_vec = self.vectorizer.transform([clean_text])
        prediction = self.model.predict(x_vec)
        return int(prediction[0])
    
    def printReport(self, y_true, y_pred):
        """
        ใช้สำหรับแสดงผลค่าต่างๆเช่น accuracy, confustion matrix, f1 บลาๆ สำหรับวัดผลโมเดล
        """
        print("Accuracy:", accuracy_score(y_true, y_pred))
        print("\nClassification Report:\n", classification_report(y_true, y_pred))
    
    def saveModel(self):
        """
        เซฟโมเดลไปที่โฟลเดอร์ models/
        """
        os.makedirs(self.models_dir, exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.vec_path, 'wb') as f:
            pickle.dump(self.vectorizer, f)

    def predictScore(self, clean_text: str):
        """
        รับข้อความที่ผ่านการ Clean แล้ว ทำนายผลพร้อมคืนค่าความมั่นใจ (Confidence Score)
        """
        if not self.is_loaded:
            self.load()
            
        x_vec = self.vectorizer.transform([clean_text])
        prob = self.model.predict_proba(x_vec)[0] 
        prediction = self.model.predict(x_vec)[0]
        confidence = max(prob) 
        return int(prediction), float(confidence)

 
    
    
if __name__ == "__main__" :
    print("Hello World")