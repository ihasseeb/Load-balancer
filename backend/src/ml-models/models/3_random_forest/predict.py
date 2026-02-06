"""
Random Forest Prediction Script
Load trained model and make predictions for load balancing
"""

import joblib
import json
import numpy as np
import pandas as pd

def load_model():
    """Load trained Random Forest model"""
    print("📖 Loading Random Forest model...")
    
    model = joblib.load('model.pkl')
    scaler = joblib.load('scaler.pkl')
    
    with open('feature_cols.json', 'r') as f:
        feature_cols = json.load(f)
    
    print("✅ Model loaded successfully!")
    return model, scaler, feature_cols

def predict_server(model, scaler, features, feature_cols):
    """
    Predict best server for given features
    
    Args:
        model: Trained Random Forest model
        scaler: Feature scaler
        features: Dict of feature values
        feature_cols: List of feature column names
    
    Returns:
        server_id: Predicted server ID (0, 1, 2, ...)
    """
    # Create feature vector
    feature_vector = [features.get(col, 0) for col in feature_cols]
    feature_vector = np.array(feature_vector).reshape(1, -1)
    
    # Scale features
    feature_vector_scaled = scaler.transform(feature_vector)
    
    # Predict
    server_id = model.predict(feature_vector_scaled)[0]
    
    # Get prediction probabilities
    probabilities = model.predict_proba(feature_vector_scaled)[0]
    
    return int(server_id), probabilities

def main():
    """Example usage"""
    # Load model
    model, scaler, feature_cols = load_model()
    
    # Example features
    features = {
        'request_count': 1250,
        'avg_response_time': 150,
        'error_rate': 0.02,
        'bot_rate': 0.1,
        'hour': 14,
        'weekday': 2,
        'is_weekend': 0,
        'request_count_lag_1': 1200,
        'request_count_lag_2': 1180,
        'request_count_lag_3': 1220,
        'request_count_lag_4': 1190,
        'request_count_lag_5': 1210,
        'avg_response_time_lag_1': 145,
        'avg_response_time_lag_2': 148,
        'error_rate_lag_1': 0.018,
        'error_rate_lag_2': 0.022,
        'request_count_rolling_mean': 1200,
        'request_count_rolling_std': 25
    }
    
    # Predict
    server_id, probabilities = predict_server(model, scaler, features, feature_cols)
    
    print(f"\n🎯 Prediction:")
    print(f"   Route to: server_{server_id}")
    print(f"   Confidence: {probabilities[server_id]:.2%}")
    print(f"\n   All probabilities:")
    for i, prob in enumerate(probabilities):
        print(f"      server_{i}: {prob:.2%}")

if __name__ == "__main__":
    main()
