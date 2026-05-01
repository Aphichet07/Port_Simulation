import os
import sys

base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, base_dir)

from model.classify import ClassifyModel
from feature.feature import FeatureEngineer

"""
หน้าเรียกใช้งาน (Interface Layer)
รับข้อความดิบเข้ามา -> คลีนข้อความ -> ทำนายผลด้วยโมเดล -> คืนค่าเป็น 0 หรือ 1
  0 = คุยทั่วไป
  1 = เกี่ยวกับหุ้น
"""


class ClassifyFunction:
    def __init__(self):
        self.feature = FeatureEngineer()
        self.classifier = ClassifyModel()
        self.classifier.load()

    def classify(self, text: str) -> int:
        """รับข้อความดิบ -> คืนค่า 0 หรือ 1"""
        # 1. คลีนข้อความก่อน
        clean_msg = self.feature.clean_text(text)

        # 2. ส่งเข้าโมเดลเพื่อทำนาย (โมเดลรับ string เดียว คืน int 0/1 เลย)
        result, score = self.classifier.predictScore(text)

        return int(result), float(score)


if __name__ == "__main__":
    clf = ClassifyFunction()

    print("ทดสอบ: 'PTT น่าซื้อมั้ย' ->", clf.classify("PTT น่าซื้อมั้ย"))
    print("ทดสอบ: 'สวัสดีจ้า' ->", clf.classify("สวัสดีจ้า"))