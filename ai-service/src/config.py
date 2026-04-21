import os

class Config:
    # Data Settings
    DEFAULT_TICKER = "BTC"
    START_DATE = "2020-01-01"
    END_DATE = "2026-01-01"
    WINDOW_SIZE = 60
    TRAIN_SPLIT = 0.8
    
    # Model Hyperparameters
    BATCH_SIZE = 32
    EPOCHS = 50
    LEARNING_RATE = 0.001
    
    # Feature Columns
    FEATURE_COLS = ['Open', 'High', 'Low', 'Close', 'Volume', 'RSI', 'EMA_50']
    
    # Paths
    MODEL_DIR = "saved_models"
    MODEL_NAME = "lstm_stock_model.keras"
    SCALER_NAME = "scaler.pkl"
    
    @classmethod
    def get_model_path(cls):
        return os.path.join(cls.MODEL_DIR, cls.MODEL_NAME)
    
    @classmethod
    def get_scaler_path(cls):
        return os.path.join(cls.MODEL_DIR, cls.SCALER_NAME)
