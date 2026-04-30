import pandas as pd
from sklearn.model_selection import train_test_split
from classify import ClassifyModel

def train():
    print("Start Training")

    # ข้อมูลตัวอย่างสำหรับเทรน (1=หุ้น, 0=ทั่วไป)
    x = [
        "AAPL น่าซื้อมั้ย", "PTT ปันผลเท่าไหร่", "สอนดูกราฟหุ้นหน่อย", 
        "ติดดอยทำยังไงดี", "อยากเปิดพอร์ต", "SET วันนี้บวกหรือลบ",
        "สวัสดี", "กินข้าวหรือยัง", "อากาศดีจัง", 
        "ทำอะไรได้บ้าง", "ลาก่อน", "ฝนตกไหม"
    ]
    y = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]

    # 2. train-test split
    X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=42)

    # 3. train model
    classifier = ClassifyModel()
    classifier.train(X_train, y_train)

    # 4. test model
    predictions = classifier.evalute(X_test)
    classifier.printReport(y_test, predictions)
    print("End Training")

if __name__ == "__main__":
    train()