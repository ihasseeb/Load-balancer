"""
XGBoost Load Balancer - Training Script
Higher accuracy than Random Forest with gradient boosting
"""

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
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
    
    print(f"   Loaded {len(df)} samples")
    return df

def prepare_data(df, num_servers=3):
    """Prepare data for training"""
    print(f"🔧 Preparing data for {num_servers} servers...")
    
    # Create server labels
    df['load_level'] = pd.qcut(df['request_count'], q=num_servers, labels=False, duplicates='drop')
    
    # Feature columns
    feature_cols = [
        'request_count', 'avg_response_time', 'error_rate', 'bot_rate',
        'hour', 'weekday', 'is_weekend',
        'request_count_lag_1', 'request_count_lag_2', 'request_count_lag_3',
        'request_count_lag_4', 'request_count_lag_5',
        'avg_response_time_lag_1', 'avg_response_time_lag_2',
        'error_rate_lag_1', 'error_rate_lag_2',
        'request_count_rolling_mean', 'request_count_rolling_std'
    ]
    
    feature_cols = [col for col in feature_cols if col in df.columns]
    
    X = df[feature_cols]
    y = df['load_level']
    
    return X, y, feature_cols

def train_model(X_train, y_train, X_test, y_test):
    """Train XGBoost model"""
    print(f"🚀 Training XGBoost...")
    
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='mlogloss',
        early_stopping_rounds=10
    )
    
    # Train with validation
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=True
    )
    
    print("✅ Training complete!")
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate model"""
    print("\n📊 Evaluating model...")
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    print(f"\n   Accuracy: {accuracy:.4f}")
    print(f"\n   Classification Report:")
    print(classification_report(y_test, y_pred))
    
    return {
        'accuracy': accuracy,
        'classification_report': report
    }

def plot_feature_importance(model, feature_cols):
    """Plot feature importance"""
    print("\n📈 Plotting feature importance...")
    
    importance = model.feature_importances_
    indices = np.argsort(importance)[::-1]
    
    plt.figure(figsize=(10, 6))
    plt.title('Feature Importance - XGBoost')
    plt.bar(range(len(importance)), importance[indices])
    plt.xticks(range(len(importance)), [feature_cols[i] for i in indices], rotation=90)
    plt.tight_layout()
    plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
    print(f"💾 Saved to: feature_importance.png")
    
    return {feature_cols[i]: float(importance[i]) for i in range(len(feature_cols))}

def save_model(model, scaler, feature_cols, metrics):
    """Save model"""
    joblib.dump(model, 'model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    
    with open('feature_cols.json', 'w') as f:
        json.dump(feature_cols, f, indent=2)
    
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print("\n💾 Model saved!")

def main():
    """Main training pipeline"""
    print("🚀 XGBoost Training Pipeline\n")
    
    FEATURES_FILE = "../../data/features/features.parquet"
    
    if not os.path.exists(FEATURES_FILE):
        print(f"❌ Features file not found: {FEATURES_FILE}")
        return
    
    # Load and prepare data
    df = load_features(FEATURES_FILE)
    X, y, feature_cols = prepare_data(df, num_servers=3)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train
    model = train_model(X_train_scaled, y_train, X_test_scaled, y_test)
    
    # Evaluate
    metrics = evaluate_model(model, X_test_scaled, y_test)
    
    # Feature importance
    feature_importance = plot_feature_importance(model, feature_cols)
    metrics['feature_importance'] = feature_importance
    
    # Save
    save_model(model, scaler, feature_cols, metrics)
    
    print(f"\n✅ Training complete! Accuracy: {metrics['accuracy']:.2%}")

if __name__ == "__main__":
    main()
