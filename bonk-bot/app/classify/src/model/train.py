import os
import sys
import pandas as pd
from sklearn.model_selection import train_test_split

# เพิ่ม path ให้ import classify ได้
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import ClassifyModel

def train():
    print("Start train model")

    # 1. find path data (cleanData.csv)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, 'data', 'process', 'cleanData.csv')

    if not os.path.exists(data_path):
        print(f"Not found file: {data_path}")
        print("   Please run dataset.py in data/raw/ to create cleanData.csv")
        return

    # 2. load data
    df = pd.read_csv(data_path)
    print(f"Load data successfully: {len(df)} rows")
    print(f"Columns: {df.columns.tolist()}")

    # 3. checking columns
    if 'clean_text' not in df.columns or 'label' not in df.columns:
        print("Not found columns 'clean_text' or 'label' in file")
        return

    # 4. separate Feature (X) and Label (y)
    X = df['clean_text'].fillna('')
    y = df['label']

    # 5. แบ่ง train/test (75% train, 25% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42
    )
    print(f"Train: {len(X_train)} rows | Test: {len(X_test)} rows")

    # 6. เทรนโมเดล
    classifier = ClassifyModel()
    classifier.train(X_train, y_train)
    print("Done")

    # 7. ประเมินผลด้วยชุด Test
    predictions = classifier.evaluate(X_test)
    classifier.printReport(y_test, predictions)
    print("Done train model")


if __name__ == "__main__":
    train()