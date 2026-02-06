"""
Random Forest Load Balancer - ML Model Training
Trains a Random Forest classifier to predict optimal server routing
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
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

def prepare_data(df, num_servers=3):
    """
    Prepare data for training
    
    Args:
        df: Features DataFrame
        num_servers: Number of servers to simulate
    """
    print(f"🔧 Preparing data for {num_servers} servers...")
    
    # Create synthetic server labels based on load
    # High load -> server 0, Medium -> server 1, Low -> server 2
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
    
    # Filter available columns
    feature_cols = [col for col in feature_cols if col in df.columns]
    
    X = df[feature_cols]
    y = df['load_level']
    
    print(f"   Features: {len(feature_cols)}")
    print(f"   Samples: {len(X)}")
    print(f"   Classes: {y.nunique()}")
    
    return X, y, feature_cols

def train_model(X_train, y_train, n_estimators=100, max_depth=10):
    """
    Train Random Forest model
    
    Args:
        X_train: Training features
        y_train: Training labels
        n_estimators: Number of trees
        max_depth: Maximum tree depth
    """
    print(f"🌲 Training Random Forest (n_estimators={n_estimators}, max_depth={max_depth})...")
    
    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    model.fit(X_train, y_train)
    
    print("✅ Training complete!")
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    print("\n📊 Evaluating model...")
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"\n   Accuracy: {accuracy:.4f}")
    print(f"\n   Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save confusion matrix plot
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix - Random Forest')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    print(f"\n💾 Saved confusion matrix to: confusion_matrix.png")
    
    return {
        'accuracy': accuracy,
        'classification_report': report,
        'confusion_matrix': cm.tolist()
    }

def plot_feature_importance(model, feature_cols):
    """Plot feature importance"""
    print("\n📈 Plotting feature importance...")
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    # Plot
    plt.figure(figsize=(10, 6))
    plt.title('Feature Importance - Random Forest')
    plt.bar(range(len(importances)), importances[indices])
    plt.xticks(range(len(importances)), [feature_cols[i] for i in indices], rotation=90)
    plt.tight_layout()
    plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
    print(f"💾 Saved feature importance to: feature_importance.png")
    
    # Print top features
    print("\n🔝 Top 10 Features:")
    for i in range(min(10, len(indices))):
        idx = indices[i]
        print(f"   {i+1}. {feature_cols[idx]}: {importances[idx]:.4f}")
    
    return {feature_cols[i]: float(importances[i]) for i in range(len(feature_cols))}

def save_model(model, scaler, feature_cols, metrics):
    """Save trained model and artifacts"""
    print("\n💾 Saving model...")
    
    # Save model
    joblib.dump(model, 'model.pkl')
    print("   ✅ Saved model.pkl")
    
    # Save scaler
    joblib.dump(scaler, 'scaler.pkl')
    print("   ✅ Saved scaler.pkl")
    
    # Save feature columns
    with open('feature_cols.json', 'w') as f:
        json.dump(feature_cols, f, indent=2)
    print("   ✅ Saved feature_cols.json")
    
    # Save metrics
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print("   ✅ Saved metrics.json")

def main():
    """Main training pipeline"""
    print("🚀 Random Forest Training Pipeline\n")
    
    # Paths
    FEATURES_FILE = "../../data/features/features.parquet"
    
    # Check if features exist
    if not os.path.exists(FEATURES_FILE):
        print(f"❌ Features file not found: {FEATURES_FILE}")
        print("   Please run preprocessing first:")
        print("   1. python preprocessing/parse_logs.py")
        print("   2. python preprocessing/extract_features.py")
        return
    
    # Load features
    df = load_features(FEATURES_FILE)
    
    # Prepare data
    X, y, feature_cols = prepare_data(df, num_servers=3)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n📊 Data Split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Testing: {len(X_test)} samples")
    
    # Scale features
    print(f"\n🔧 Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = train_model(X_train_scaled, y_train, n_estimators=100, max_depth=10)
    
    # Evaluate
    metrics = evaluate_model(model, X_test_scaled, y_test)
    
    # Feature importance
    feature_importance = plot_feature_importance(model, feature_cols)
    metrics['feature_importance'] = feature_importance
    
    # Save everything
    save_model(model, scaler, feature_cols, metrics)
    
    print("\n✅ Training complete!")
    print(f"\n📊 Final Accuracy: {metrics['accuracy']:.2%}")

if __name__ == "__main__":
    main()
