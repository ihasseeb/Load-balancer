"""
LSTM Time-Series Predictor - Training Script
Predicts future load for proactive scaling
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib
import json
import matplotlib.pyplot as plt
import os

def load_features(features_file):
    """Load preprocessed features"""
    print(f"📖 Loading features from: {features_file}")
    
    if features_file.endswith('.parquet'):
        df = pd.read_parquet(features_file)
    else:
        df = pd.read_csv(features_file)
    
    # Sort by timestamp
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    print(f"   Loaded {len(df)} samples")
    return df

def create_sequences(data, seq_length=10):
    """
    Create sequences for LSTM
    
    Args:
        data: Time-series data
        seq_length: Length of input sequence
    
    Returns:
        X: Input sequences
        y: Target values
    """
    X, y = [], []
    
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length])
    
    return np.array(X), np.array(y)

def build_model(seq_length, n_features):
    """Build LSTM model"""
    print(f"🏗️ Building LSTM model (seq_length={seq_length}, features={n_features})...")
    
    model = Sequential([
        LSTM(50, activation='relu', return_sequences=True, input_shape=(seq_length, n_features)),
        Dropout(0.2),
        LSTM(50, activation='relu'),
        Dropout(0.2),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
    print(model.summary())
    return model

def train_model(model, X_train, y_train, X_val, y_val, epochs=50, batch_size=32):
    """Train LSTM model"""
    print(f"\n🚀 Training LSTM (epochs={epochs}, batch_size={batch_size})...")
    
    # Callbacks
    early_stop = keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
    reduce_lr = keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=0.00001)
    
    # Train
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stop, reduce_lr],
        verbose=1
    )
    
    print("✅ Training complete!")
    return model, history

def evaluate_model(model, X_test, y_test, scaler):
    """Evaluate LSTM model"""
    print("\n📊 Evaluating model...")
    
    # Predict
    y_pred = model.predict(X_test)
    
    # Inverse transform
    y_test_original = scaler.inverse_transform(y_test.reshape(-1, 1))
    y_pred_original = scaler.inverse_transform(y_pred)
    
    # Metrics
    mae = mean_absolute_error(y_test_original, y_pred_original)
    rmse = np.sqrt(mean_squared_error(y_test_original, y_pred_original))
    r2 = r2_score(y_test_original, y_pred_original)
    
    print(f"\n   MAE: {mae:.2f}")
    print(f"   RMSE: {rmse:.2f}")
    print(f"   R² Score: {r2:.4f}")
    
    # Plot predictions
    plt.figure(figsize=(12, 6))
    plt.plot(y_test_original[:100], label='Actual', alpha=0.7)
    plt.plot(y_pred_original[:100], label='Predicted', alpha=0.7)
    plt.title('LSTM Predictions vs Actual')
    plt.xlabel('Time Step')
    plt.ylabel('Request Count')
    plt.legend()
    plt.savefig('predictions.png', dpi=300, bbox_inches='tight')
    print(f"\n💾 Saved predictions plot to: predictions.png")
    
    return {
        'mae': float(mae),
        'rmse': float(rmse),
        'r2_score': float(r2)
    }

def save_model(model, scaler, metrics, seq_length):
    """Save LSTM model"""
    print("\n💾 Saving model...")
    
    # Save model
    model.save('lstm_model.h5')
    print("   ✅ Saved lstm_model.h5")
    
    # Save scaler
    joblib.dump(scaler, 'scaler.pkl')
    print("   ✅ Saved scaler.pkl")
    
    # Save config
    config = {
        'seq_length': seq_length,
        'metrics': metrics
    }
    
    with open('config.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("   ✅ Saved config.json")

def main():
    """Main training pipeline"""
    print("🚀 LSTM Training Pipeline\n")
    
    FEATURES_FILE = "../../data/features/features.parquet"
    SEQ_LENGTH = 10
    
    if not os.path.exists(FEATURES_FILE):
        print(f"❌ Features file not found: {FEATURES_FILE}")
        return
    
    # Load features
    df = load_features(FEATURES_FILE)
    
    # Use request_count as target
    data = df[['request_count']].values
    
    # Scale data
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    
    # Create sequences
    print(f"\n🔄 Creating sequences (seq_length={SEQ_LENGTH})...")
    X, y = create_sequences(data_scaled, seq_length=SEQ_LENGTH)
    
    print(f"   X shape: {X.shape}")
    print(f"   y shape: {y.shape}")
    
    # Split data
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, shuffle=False)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, shuffle=False)
    
    print(f"\n📊 Data Split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Validation: {len(X_val)} samples")
    print(f"   Testing: {len(X_test)} samples")
    
    # Build model
    model = build_model(seq_length=SEQ_LENGTH, n_features=1)
    
    # Train
    model, history = train_model(model, X_train, y_train, X_val, y_val, epochs=50, batch_size=32)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test, scaler)
    
    # Save
    save_model(model, scaler, metrics, SEQ_LENGTH)
    
    print(f"\n✅ Training complete!")
    print(f"   MAE: {metrics['mae']:.2f}")
    print(f"   RMSE: {metrics['rmse']:.2f}")
    print(f"   R² Score: {metrics['r2_score']:.4f}")

if __name__ == "__main__":
    main()
