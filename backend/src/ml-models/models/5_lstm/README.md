# LSTM Time-Series Predictor

## 📖 Overview

LSTM (Long Short-Term Memory) is a deep learning model designed for time-series prediction. It predicts future load based on historical patterns.

## 🎯 Algorithm

LSTM uses recurrent neural networks with memory cells:
- Remembers long-term patterns
- Learns from sequences
- Predicts future values
- Handles temporal dependencies

## 📊 Input/Output

### Input:
- **Sequence**: Last 10 minutes of metrics
- **Features**: request_count, response_time, error_rate

### Output:
- **Prediction**: Next minute's request count
- **Use Case**: Proactive scaling

## 🏗️ Model Architecture

```
LSTM Model
├── LSTM Layer 1: 50 units
├── Dropout: 0.2
├── LSTM Layer 2: 50 units
├── Dropout: 0.2
└── Dense Layer: 1 unit (output)
```

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| MAE | <100 requests |
| RMSE | <150 requests |
| R² Score | 0.80-0.85 |
| Prediction Time | ~120ms |

## ✅ Advantages

- ✅ **Proactive** - Predicts future load
- ✅ **Temporal Patterns** - Learns time dependencies
- ✅ **Accurate** - Good for time-series
- ✅ **Scalable** - Handles long sequences

## 🚀 Usage

```bash
# Train model
python train.py

# Make predictions
python predict.py
```

## 📈 Use Case

- Predict load 5-10 minutes ahead
- Enable proactive server scaling
- Prevent overload before it happens
