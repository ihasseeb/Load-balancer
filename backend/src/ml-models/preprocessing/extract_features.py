"""
Feature Extraction for Load Balancing ML Models
Extracts time-series features, aggregates metrics, and prepares training data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from tqdm import tqdm

def load_parsed_logs(file_path):
    """Load parsed logs"""
    print(f"📖 Loading parsed logs from: {file_path}")
    df = pd.read_csv(file_path)
    
    # Convert timestamp
    df['timestamp'] = pd.to_datetime(df['timestamp'], format='%d/%b/%Y:%H:%M:%S %z', errors='coerce')
    
    return df

def extract_temporal_features(df):
    """Extract time-based features"""
    print("🕐 Extracting temporal features...")
    
    df['hour'] = df['timestamp'].dt.hour
    df['day'] = df['timestamp'].dt.day
    df['weekday'] = df['timestamp'].dt.dayofweek
    df['month'] = df['timestamp'].dt.month
    df['minute'] = df['timestamp'].dt.minute
    
    # Time of day categories
    df['time_of_day'] = pd.cut(df['hour'], 
                                bins=[0, 6, 12, 18, 24], 
                                labels=['night', 'morning', 'afternoon', 'evening'])
    
    return df

def extract_request_features(df):
    """Extract request-related features"""
    print("📊 Extracting request features...")
    
    # Detect bots
    df['is_bot'] = df['user_agent'].str.contains('bot|crawler|spider', case=False, na=False)
    
    # HTTP method one-hot encoding
    df['is_get'] = (df['method'] == 'GET').astype(int)
    df['is_post'] = (df['method'] == 'POST').astype(int)
    df['is_put'] = (df['method'] == 'PUT').astype(int)
    df['is_delete'] = (df['method'] == 'DELETE').astype(int)
    
    # Status code categories
    df['is_success'] = (df['status'] < 400).astype(int)
    df['is_client_error'] = ((df['status'] >= 400) & (df['status'] < 500)).astype(int)
    df['is_server_error'] = (df['status'] >= 500).astype(int)
    
    return df

def aggregate_metrics(df, interval='1min'):
    """
    Aggregate metrics per time interval for load balancing
    
    Args:
        df: DataFrame with parsed logs
        interval: Time interval for aggregation (e.g., '1min', '5min')
    """
    print(f"📈 Aggregating metrics per {interval}...")
    
    # Group by time interval
    df_agg = df.set_index('timestamp').resample(interval).agg({
        'ip': 'count',                          # Request count
        'size': ['sum', 'mean', 'std'],        # Response size stats
        'status': lambda x: (x >= 500).sum(),  # Server errors
        'is_bot': 'sum',                       # Bot requests
        'is_success': 'sum',                   # Successful requests
        'is_client_error': 'sum',              # Client errors
        'is_server_error': 'sum'               # Server errors
    }).reset_index()
    
    # Flatten column names
    df_agg.columns = ['timestamp', 'request_count', 'total_bytes', 'avg_bytes', 
                      'std_bytes', 'error_count', 'bot_count', 'success_count',
                      'client_error_count', 'server_error_count']
    
    # Fill NaN with 0
    df_agg = df_agg.fillna(0)
    
    # Calculate derived metrics
    df_agg['error_rate'] = df_agg['error_count'] / (df_agg['request_count'] + 1)
    df_agg['bot_rate'] = df_agg['bot_count'] / (df_agg['request_count'] + 1)
    df_agg['avg_response_time'] = df_agg['avg_bytes'] / 1000  # Simulated (bytes/1000)
    
    # Add temporal features
    df_agg['hour'] = df_agg['timestamp'].dt.hour
    df_agg['weekday'] = df_agg['timestamp'].dt.dayofweek
    df_agg['is_weekend'] = (df_agg['weekday'] >= 5).astype(int)
    
    return df_agg

def create_time_series_features(df, lookback=5):
    """
    Create time-series features for LSTM
    
    Args:
        df: Aggregated metrics DataFrame
        lookback: Number of previous timesteps to include
    """
    print(f"🔄 Creating time-series features (lookback={lookback})...")
    
    # Sort by timestamp
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # Create lagged features
    for i in range(1, lookback + 1):
        df[f'request_count_lag_{i}'] = df['request_count'].shift(i)
        df[f'avg_response_time_lag_{i}'] = df['avg_response_time'].shift(i)
        df[f'error_rate_lag_{i}'] = df['error_rate'].shift(i)
    
    # Rolling statistics
    df['request_count_rolling_mean'] = df['request_count'].rolling(window=lookback).mean()
    df['request_count_rolling_std'] = df['request_count'].rolling(window=lookback).std()
    
    # Drop rows with NaN (due to lagging)
    df = df.dropna()
    
    return df

def create_load_labels(df, threshold_percentile=75):
    """
    Create load labels for classification
    High load = 1, Low load = 0
    """
    print(f"🏷️ Creating load labels (threshold={threshold_percentile}th percentile)...")
    
    threshold = df['request_count'].quantile(threshold_percentile / 100)
    df['high_load'] = (df['request_count'] > threshold).astype(int)
    
    print(f"   Threshold: {threshold:.0f} requests/min")
    print(f"   High load samples: {df['high_load'].sum()} ({df['high_load'].mean()*100:.1f}%)")
    
    return df

def save_features(df, output_dir):
    """Save extracted features"""
    os.makedirs(output_dir, exist_ok=True)
    
    # Save as CSV
    csv_path = os.path.join(output_dir, "features.csv")
    df.to_csv(csv_path, index=False)
    print(f"💾 Saved features to: {csv_path}")
    
    # Save as Parquet (faster loading)
    parquet_path = os.path.join(output_dir, "features.parquet")
    df.to_parquet(parquet_path, index=False)
    print(f"💾 Saved features to: {parquet_path}")
    
    return csv_path, parquet_path

def main():
    """Main execution"""
    # Paths (fixed for correct directory structure)
    PROCESSED_DATA_DIR = "../data/processed"
    FEATURES_DIR = "../data/features"
    
    # Load parsed logs
    parsed_logs_file = os.path.join(PROCESSED_DATA_DIR, "parsed_logs.csv")
    df = load_parsed_logs(parsed_logs_file)
    
    # Extract features
    df = extract_temporal_features(df)
    df = extract_request_features(df)
    
    # Aggregate metrics (1-minute intervals)
    df_metrics = aggregate_metrics(df, interval='1min')
    
    # Create time-series features
    df_features = create_time_series_features(df_metrics, lookback=10)
    
    # Create labels
    df_features = create_load_labels(df_features, threshold_percentile=75)
    
    # Save features
    save_features(df_features, FEATURES_DIR)
    
    # Display summary
    print("\n📊 Feature Summary:")
    print(df_features.info())
    print("\n📈 Sample Features:")
    print(df_features.head())
    
    print("\n✅ Feature extraction complete!")

if __name__ == "__main__":
    main()
