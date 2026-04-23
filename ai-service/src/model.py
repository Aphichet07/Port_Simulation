import keras
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout

def build_lstm_model(input_shape):
    """
    สร้างโครงสร้างโมเดล LSTM
    input_shape = (window_size, จำนวน features)
    """
    model = Sequential([
        # ชั้นรับข้อมูล
        LSTM(units=50, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),

        # ชั้นคิดวิเคราะห์
        LSTM(units=50, return_sequences=False),
        Dropout(0.2),

        # ชั้นตัดสินใจ (Output Layer) - Binary Classification
        Dense(units=1, activation='sigmoid')
    ])

    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    return model