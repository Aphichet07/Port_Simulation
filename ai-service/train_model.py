import cuda_setup
cuda_setup.setup_cuda()

import os
import joblib
import argparse
import numpy as np
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from src.data_pipeline import fetch_data, scale_data, create_sequences
from src.indicaltor import add_features
from src.model import build_lstm_model
from src.config import Config

def parse_args():
    """จัดการรับค่าผ่าน Command Line"""
    parser = argparse.ArgumentParser(description="Stock Price Prediction Training Pipeline")
    parser.add_argument("--ticker", type=str, default=Config.DEFAULT_TICKER, help="Symbol of the stock (e.g., NVDA)")
    parser.add_argument("--epochs", type=int, default=Config.EPOCHS, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=Config.BATCH_SIZE, help="Batch size for training")
    return parser.parse_args()

def prepare_data(ticker, start_date, end_date):
    """ทำกระบวนการจัดเตรียมข้อมูลตั้งแต่ Load จนถึง Split"""
    print(f"\n[1/4] Loading and Preprocessing data for {ticker}...")
    
    # 1. Fetch
    df = fetch_data(ticker, start_date, end_date)
    
    # 2. Add features
    df = add_features(df)
    
    # 3. Scaling
    scaled_features, scaler = scale_data(df, Config.FEATURE_COLS)
    target_data = df['Target'].values
    
    # 4. Create sequences
    X, y = create_sequences(scaled_features, target_data, window_size=Config.WINDOW_SIZE)
    
    # 5. Temporal Split
    split_idx = int(len(X) * Config.TRAIN_SPLIT)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    return X_train, X_test, y_train, y_test, scaler

def train_pipeline(args):
    """รันกระบวนการเทรนทั้งหมด"""
    
    # เตรียมข้อมูล
    X_train, X_test, y_train, y_test, scaler = prepare_data(
        args.ticker, Config.START_DATE, Config.END_DATE
    )
    
    # ตรวจสอบความถูกต้องของสัดส่วนข้อมูล
    print(f"Data Prepared: Train={len(X_train)}, Validation={len(X_test)}")

    # สร้างและคอมไพล์ Model
    print("\n[2/4] Building LSTM Architecture...")
    model = build_lstm_model(input_shape=(X_train.shape[1], X_train.shape[2]))

    # ตั้งค่า Callbacks (มาตรฐานระดับ Global)
    if not os.path.exists(Config.MODEL_DIR):
        os.makedirs(Config.MODEL_DIR)

    callbacks = [
        # หยุดเทรนถ้าโมเดลไม่ดีขึ้น 5 รอบ (Loss ไม่ลด) เพื่อป้องกัน Overfitting
        EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1),
        # เซฟโมเดลเฉพาะรอบที่แม่นยำที่สุดเท่านั้น
        ModelCheckpoint(Config.get_model_path(), monitor='val_loss', save_best_only=True, verbose=1)
    ]

    # เริ่มการเทรน
    print(f"\n[3/4] Starting training for {args.epochs} epochs...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=callbacks,
        verbose=1
    )

    # บันทึก Scaler
    print("\n[4/4] Finalizing and Saving assets...")
    joblib.dump(scaler, Config.get_scaler_path())
    print(f"Artifacts saved to {Config.MODEL_DIR}/ directory.")
    print("Training Pipeline Completed Successfully!")

if __name__ == "__main__":
    args = parse_args()
    train_pipeline(args)