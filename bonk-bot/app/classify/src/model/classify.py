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
import pickle

"""
อ่านไฟล์ csv จากนั้นเขียนแบ่ง train test ปกติ แล้วสร้าง object ClassifyModel ขึ้นมา
"""


class ClassifyModel:
    def __init__(self):
        """
        ใช้ สำหรับกำหนดค่า parameter 
        """
        self.vectorizer = TfidfVectorizer()
        self.model = LogisticRegression(random_state=42)
        self.is_loaded = False
        
    def load(self):
        """
        โหลดโมเดลที่เซฟไว้ขึ้นมา
        """
        # ชี้ไปที่โฟลเดอร์ models/ ที่อยู่ระดับเดียวกับ src/
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, 'models', 'model_class.pkl')
        vec_path = os.path.join(base_dir, 'models', 'vectorizer.pkl')
        if os.path.exists(model_path) and os.path.exists(vec_path):
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(vec_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            self.is_loaded = True
        else:
            print("Can't find model.")
    def train(self, x, y):
        """
        ใช้ train model
        """
        # แปลง Text เป็นตัวเลขก่อน
        x_vec = self.vectorizer.fit_transform(x)
        self.model.fit(x_vec, y)
        
        # เซฟโมเดลไปที่โฟลเดอร์ models/
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        models_dir = os.path.join(base_dir, 'models')
        os.makedirs(models_dir, exist_ok=True)
        with open(os.path.join(models_dir, 'model_class.pkl'), 'wb') as f:
            pickle.dump(self.model, f)
        with open(os.path.join(models_dir, 'vectorizer.pkl'), 'wb') as f:
            pickle.dump(self.vectorizer, f)
            

    def evaluate(self, x_test):
        """
        ใช้สำหรับ test model
        """
        x_vec = self.vectorizer.transform(x_test)
        return self.model.predict(x_vec)
        
    def predict(self, text: str) -> int:
        """
        รับข้อความ 1 ประโยค แล้วทำนายเป็น 0 หรือ 1
        """
        if not self.is_loaded:
            self.load()
            
        x_vec = self.vectorizer.transform([text])
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
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        models_dir = os.path.join(base_dir, 'models')
        os.makedirs(models_dir, exist_ok=True)
        with open(os.path.join(models_dir, 'model_class.pkl'), 'wb') as f:
            pickle.dump(self.model, f)
        with open(os.path.join(models_dir, 'vectorizer.pkl'), 'wb') as f:
            pickle.dump(self.vectorizer, f)

    def predictScore(self, text: str):
        if not self.is_loaded:
            self.load()
        from feature.feature import FeatureEngineer
        fe = FeatureEngineer()
        clean_text = fe.clean_text(text)
        x_vec = self.vectorizer.transform([clean_text])
        prob = self.model.predict_proba(x_vec)[0] 
        prediction = self.model.predict(x_vec)[0]
        confidence = max(prob) 
        return prediction, confidence

 
    
    
if __name__ == "__main__" :
    print("Hello World")