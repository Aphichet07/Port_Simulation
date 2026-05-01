"""
main.py - แผงควบคุมหลักของระบบ Classify

วิธีใช้:
  python main.py --train               -> เทรนโมเดลใหม่จาก cleanData.csv
  python main.py --predict "ข้อความ"  -> ทำนายผลข้อความ
  python main.py --clean               -> รันขั้นตอนทำความสะอาดข้อมูล (data/raw -> data/process)
"""

import os
import sys
import argparse

# เพิ่ม path ให้ import ไฟล์ใน src/ 
src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
sys.path.insert(0, src_dir)


def run_clean():
    """รัน pipeline ทำความสะอาดข้อมูล"""
    import pandas as pd
    from feature.feature import FeatureEngineer

    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_path = os.path.join(base_dir, 'data', 'raw', 'dataset.csv')
    out_path = os.path.join(base_dir, 'data', 'process', 'cleanData.csv')

    if not os.path.exists(raw_path):
        print(f"Can't find file: {raw_path}")
        return

    print("Start clean data")
    df = pd.read_csv(raw_path)
    print(f"Loading raw data: {len(df)} rows")
    fe = FeatureEngineer()
    df['clean_text'] = df['text'].apply(fe.clean_text)

    initial_rows = len(df)
    df = df.drop_duplicates(subset=['clean_text'])
    final_rows = len(df)
    print(f"Removed {initial_rows - final_rows} duplicate rows")
    print(f"Total data: {len(df)} rows") 
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Saved clean data to: {out_path}")
    print("Clean data finished")


def run_train():
    """รันการเทรนโมเดล"""
    model_dir = os.path.join(src_dir, 'model')
    sys.path.insert(0, model_dir)
    from train import train
    train()


def run_predict(text: str):
    """ทำนายผลข้อความ"""
    from function import ClassifyFunction

    clf = ClassifyFunction()
    result, score = clf.classify(text)
    label = "About Stock (1)" if result == 1 else "About Chat (0)"
    print(f"\nMessage: '{text}'")
    print(f"Prediction: {label}")
    print(f"score : {score:.2%}")

if __name__ == "__main__":

    # สร้าง parser รับค่าจาก command line
    parser = argparse.ArgumentParser(description="Classify Bot Pipeline")
    parser.add_argument('--clean', action='store_true', help='Clean data')
    parser.add_argument('--train', action='store_true', help='Train model')
    parser.add_argument('--predict', type=str, help='Predict message')

    args = parser.parse_args()

    if args.clean:
        run_clean()
    elif args.train:
        run_train()
    elif args.predict:
        run_predict(args.predict)
    else:
        print(__doc__)
