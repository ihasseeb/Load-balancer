"""
Anomaly Detection for Load Balancing - Training Script
Detects unusual traffic patterns using Isolation Forest
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns
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

def create_anomaly_labels(df):
    """
    Create synthetic anomaly labels for evaluation
    Real anomalies would be labeled manually or by domain experts
    """
    print("🏷️ Creating anomaly labels...")
    
    # Define anomaly conditions
    conditions = (
        (df['request_count'] > df['request_count'].quantile(0.95)) |  # Traffic spike
        (df['error_rate'] > 0.2) |  # High error rate
        (df['avg_response_time'] > df['avg_response_time'].quantile(0.95)) |  # Slow response
        (df['bot_rate'] > 0.5)  # Bot flood
    )
    
    df['is_anomaly'] = conditions.astype(int)
    
    anomaly_count = df['is_anomaly'].sum()
    anomaly_pct = (anomaly_count / len(df)) * 100
    
    print(f"   Anomalies: {anomaly_count} ({anomaly_pct:.2f}%)")
    
    return df

def prepare_features(df):
    """Prepare features for anomaly detection"""
    print("🔧 Preparing features...")
    
    feature_cols = [
        'request_count',
        'avg_response_time',
        'error_rate',
        'bot_rate',
        'total_bytes',
        'server_error_count',
        'client_error_count'
    ]
    
    # Filter available columns
    feature_cols = [col for col in feature_cols if col in df.columns]
    
    X = df[feature_cols]
    y = df['is_anomaly'] if 'is_anomaly' in df.columns else None
    
    print(f"   Features: {len(feature_cols)}")
    print(f"   Samples: {len(X)}")
    
    return X, y, feature_cols

def train_model(X, contamination=0.1):
    """
    Train Isolation Forest model
    
    Args:
        X: Feature matrix
        contamination: Expected proportion of anomalies (0.1 = 10%)
    """
    print(f"\n🌲 Training Isolation Forest (contamination={contamination})...")
    
    model = IsolationForest(
        contamination=contamination,
        n_estimators=100,
        max_samples=256,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    model.fit(X)
    
    print("✅ Training complete!")
    return model

def evaluate_model(model, X, y_true):
    """Evaluate anomaly detection model"""
    print("\n📊 Evaluating model...")
    
    # Predict (-1 for anomaly, 1 for normal)
    y_pred = model.predict(X)
    
    # Convert to binary (1 for anomaly, 0 for normal)
    y_pred_binary = (y_pred == -1).astype(int)
    
    # Metrics
    report = classification_report(y_true, y_pred_binary, output_dict=True)
    cm = confusion_matrix(y_true, y_pred_binary)
    
    print(f"\n   Classification Report:")
    print(classification_report(y_true, y_pred_binary, target_names=['Normal', 'Anomaly']))
    
    # Plot confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Normal', 'Anomaly'], yticklabels=['Normal', 'Anomaly'])
    plt.title('Confusion Matrix - Anomaly Detection')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    print(f"\n💾 Saved confusion matrix to: confusion_matrix.png")
    
    # Anomaly scores
    scores = model.decision_function(X)
    
    # Plot anomaly scores
    plt.figure(figsize=(12, 6))
    plt.hist(scores[y_true == 0], bins=50, alpha=0.7, label='Normal', color='blue')
    plt.hist(scores[y_true == 1], bins=50, alpha=0.7, label='Anomaly', color='red')
    plt.xlabel('Anomaly Score')
    plt.ylabel('Frequency')
    plt.title('Anomaly Score Distribution')
    plt.legend()
    plt.savefig('anomaly_scores.png', dpi=300, bbox_inches='tight')
    print(f"💾 Saved anomaly scores to: anomaly_scores.png")
    
    return {
        'classification_report': report,
        'confusion_matrix': cm.tolist(),
        'precision': report['1']['precision'],
        'recall': report['1']['recall'],
        'f1_score': report['1']['f1-score']
    }

def save_model(model, scaler, feature_cols, metrics):
    """Save anomaly detection model"""
    print("\n💾 Saving model...")
    
    joblib.dump(model, 'model.pkl')
    print("   ✅ Saved model.pkl")
    
    joblib.dump(scaler, 'scaler.pkl')
    print("   ✅ Saved scaler.pkl")
    
    with open('feature_cols.json', 'w') as f:
        json.dump(feature_cols, f, indent=2)
    print("   ✅ Saved feature_cols.json")
    
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print("   ✅ Saved metrics.json")

def main():
    """Main training pipeline"""
    print("🚀 Anomaly Detection Training Pipeline\n")
    
    FEATURES_FILE = "../../data/features/features.parquet"
    
    if not os.path.exists(FEATURES_FILE):
        print(f"❌ Features file not found: {FEATURES_FILE}")
        return
    
    # Load features
    df = load_features(FEATURES_FILE)
    
    # Create anomaly labels (for evaluation)
    df = create_anomaly_labels(df)
    
    # Prepare features
    X, y, feature_cols = prepare_features(df)
    
    # Scale features
    print("\n🔧 Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train model
    contamination = y.mean()  # Use actual anomaly rate
    model = train_model(X_scaled, contamination=contamination)
    
    # Evaluate
    metrics = evaluate_model(model, X_scaled, y)
    
    # Save
    save_model(model, scaler, feature_cols, metrics)
    
    print(f"\n✅ Training complete!")
    print(f"   Precision: {metrics['precision']:.2%}")
    print(f"   Recall: {metrics['recall']:.2%}")
    print(f"   F1 Score: {metrics['f1_score']:.4f}")

if __name__ == "__main__":
    main()
