import os
import sys
from pathlib import Path

base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(base_dir)

from model.classify import ClassifyModel
from feature.feature import FeatureEngineer
"""
เดี๋ยวอันนี้กุมาเขียนต่อเอง หรือจะลองดูก็ได้ เป็นหน้าเรียกใช้ 
ฟังก์ชั่น classify จะเริ่มแรกด้วยการสร้าง object ของ model จากนั้น เอา text เข้าไปแล้วส่งออกมาเป็น 0,1
"""


class ClassifyFunction:
    def __init__(self):
        self.classifier = ClassifyModel()
        self.classifier.load()
        self.feature = FeatureEngineer()
    
    def classify(self, text: str) -> int:
        clean_msg = self.feature.clean_text(text)
        prediction = self.classifier.predict(clean_msg)
        return prediction
    
        
if __name__ == "__main__":
    clf = ClassifyFunction()
    
    print("ทดสอบ: 'PTT น่าซื้อมั้ย' ->", clf.classify("PTT น่าซื้อมั้ย"))
    print("ทดสอบ: 'สวัสดีจ้า' ->", clf.classify("สวัสดีจ้า"))