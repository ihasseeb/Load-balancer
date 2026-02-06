# Anomaly Detection for Load Balancing

## 📖 Overview

Anomaly Detection identifies unusual traffic patterns that may indicate DDoS attacks, bot floods, or system issues. Uses unsupervised learning (Isolation Forest).

## 🎯 Algorithm

Isolation Forest:
- Unsupervised learning (no labels needed)
- Isolates anomalies by random partitioning
- Anomalies are easier to isolate than normal points
- Fast and scalable

## 📊 Features Used

- **request_count** - Requests per minute
- **avg_response_time** - Response time
- **error_rate** - Error percentage
- **bot_rate** - Bot traffic percentage
- **unique_ips** - Number of unique IPs

## 🏗️ Model Configuration

```
Isolation Forest
├── contamination: 0.1 (10% anomalies expected)
├── n_estimators: 100
├── max_samples: 256
└── random_state: 42
```

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| Precision | 90-95% |
| Recall | 85-90% |
| F1 Score | 0.88-0.92 |
| Detection Time | <50ms |

## ✅ Use Cases

- ✅ **DDoS Detection** - Sudden traffic spikes
- ✅ **Bot Detection** - Unusual request patterns
- ✅ **System Issues** - High error rates
- ✅ **Rate Limiting** - Trigger throttling

## 🚀 Usage

```bash
# Train model
python train.py

# Detect anomalies
python detect.py
```

## 📈 Anomaly Types

1. **Traffic Spike**: request_count > 3x normal
2. **High Error Rate**: error_rate > 20%
3. **Slow Response**: avg_response_time > 2x normal
4. **Bot Flood**: bot_rate > 50%

## 🔔 Alerts

When anomaly detected:
- Log to monitoring system
- Trigger rate limiting
- Alert administrators
- Scale servers if needed
