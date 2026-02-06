# 🤖 ML Models for AI-Enhanced Load Balancing

## 📁 Folder Structure

```
ml-models/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── data/
│   ├── raw/                          # Raw dataset (symlink to ../data set/)
│   ├── processed/                    # Processed & cleaned data
│   └── features/                     # Extracted features
├── preprocessing/
│   ├── parse_logs.py                 # Parse access.log
│   ├── extract_features.py           # Feature engineering
│   └── data_cleaner.py               # Data cleaning utilities
├── models/
│   ├── 1_round_robin/               # Baseline: Round Robin
│   ├── 2_least_connection/          # Baseline: Least Connection
│   ├── 3_random_forest/             # ML: Random Forest
│   ├── 4_xgboost/                   # ML: XGBoost
│   ├── 5_lstm/                      # Deep Learning: LSTM
│   ├── 6_anomaly_detection/         # Anomaly Detection
│   └── 7_reinforcement_learning/    # Advanced: Q-Learning (Optional)
├── notebooks/
│   ├── 01_data_exploration.ipynb    # EDA
│   ├── 02_preprocessing.ipynb       # Data preprocessing
│   └── 03_model_comparison.ipynb    # Compare all models
├── evaluation/
│   ├── metrics.py                   # Evaluation metrics
│   ├── compare_models.py            # Model comparison
│   └── results/                     # Results & charts
└── deployment/
    ├── model_server.py              # Flask API for models
    └── load_balancer_integration.py # Integration with Node.js
```

## 🎯 Models Overview

| # | Model | Type | Status | Accuracy Target |
|---|-------|------|--------|-----------------|
| 1 | Round Robin | Baseline | ✅ Ready | N/A |
| 2 | Least Connection | Baseline | ✅ Ready | N/A |
| 3 | Random Forest | ML | 🔄 Training | 85%+ |
| 4 | XGBoost | ML | 🔄 Training | 90%+ |
| 5 | LSTM | Deep Learning | 🔄 Training | 80%+ |
| 6 | Anomaly Detection | Unsupervised | 🔄 Training | 95%+ |
| 7 | Q-Learning | RL | ⏳ Optional | N/A |

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Preprocess Data
```bash
python preprocessing/parse_logs.py
python preprocessing/extract_features.py
```

### 3. Train Models
```bash
# Train all models
python models/3_random_forest/train.py
python models/4_xgboost/train.py
python models/5_lstm/train.py
python models/6_anomaly_detection/train.py
```

### 4. Evaluate
```bash
python evaluation/compare_models.py
```

## 📊 Expected Results

| Model | Response Time | Throughput | Accuracy |
|-------|---------------|------------|----------|
| Round Robin | 250ms | 1000 req/s | N/A |
| Least Connection | 200ms | 1200 req/s | N/A |
| Random Forest | 150ms | 1500 req/s | 85% |
| XGBoost | 130ms | 1600 req/s | 90% |
| LSTM | 120ms | 1700 req/s | 82% |

## 📝 Documentation

Each model folder contains:
- `train.py` - Training script
- `predict.py` - Prediction script
- `model.pkl` - Trained model
- `README.md` - Model documentation
- `metrics.json` - Performance metrics

## 🔗 Integration

Models are exposed via Flask API:
```bash
python deployment/model_server.py
```

API Endpoints:
- `POST /predict/random-forest` - Random Forest prediction
- `POST /predict/xgboost` - XGBoost prediction
- `POST /predict/lstm` - LSTM prediction
- `POST /detect/anomaly` - Anomaly detection
