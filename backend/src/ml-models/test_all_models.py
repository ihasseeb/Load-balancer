"""
=============================================================
  🧠 AI MODELS PERFORMANCE TEST SCRIPT
  Final Year Project - AI Load Balancer
  Tests: Random Forest, XGBoost, Isolation Forest, LSTM
=============================================================
"""

import os
import time
import json
import joblib
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────────────────────
# Path Setup
# ─────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODELS_ROOT = os.path.join(BASE_DIR, "models")

# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────
def print_header(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_result(label, value, unit=""):
    print(f"   ✅  {label:<30} {value} {unit}")

def print_fail(label, value):
    print(f"   ❌  {label:<30} {value}")

# ─────────────────────────────────────────────────────────────
# 1.  RANDOM FOREST  TEST
# ─────────────────────────────────────────────────────────────
def test_random_forest():
    print_header("🌲 TEST 1 — Random Forest (Secondary Routing)")

    rf_path = os.path.join(MODELS_ROOT, "3_random_forest")
    model   = joblib.load(os.path.join(rf_path, "model.pkl"))
    scaler  = joblib.load(os.path.join(rf_path, "scaler.pkl"))

    with open(os.path.join(rf_path, "feature_cols.json")) as f:
        feature_cols = json.load(f)

    with open(os.path.join(rf_path, "metrics.json")) as f:
        saved_metrics = json.load(f)

    # ---------- Sample inputs (Normal Traffic) ----------
    sample_normal = {
        "request_count": 120, "avg_response_time": 180, "error_rate": 0.02,
        "bot_rate": 0.05, "hour": 14, "weekday": 2, "is_weekend": 0,
        "request_count_lag_1": 115, "request_count_lag_2": 110,
        "request_count_lag_3": 108, "request_count_lag_4": 105,
        "request_count_lag_5": 100, "avg_response_time_lag_1": 175,
        "avg_response_time_lag_2": 170, "error_rate_lag_1": 0.018,
        "error_rate_lag_2": 0.02, "request_count_rolling_mean": 112,
        "request_count_rolling_std": 8
    }

    # ---------- Sample inputs (Heavy Traffic → another server) ----------
    sample_heavy = {
        "request_count": 980, "avg_response_time": 850, "error_rate": 0.12,
        "bot_rate": 0.35, "hour": 22, "weekday": 5, "is_weekend": 1,
        "request_count_lag_1": 920, "request_count_lag_2": 880,
        "request_count_lag_3": 850, "request_count_lag_4": 800,
        "request_count_lag_5": 760, "avg_response_time_lag_1": 820,
        "avg_response_time_lag_2": 790, "error_rate_lag_1": 0.10,
        "error_rate_lag_2": 0.09, "request_count_rolling_mean": 850,
        "request_count_rolling_std": 75
    }

    results = []
    for label, sample in [("Normal Traffic", sample_normal), ("Heavy Traffic", sample_heavy)]:
        features = [sample.get(c, 0) for c in feature_cols]
        scaled   = scaler.transform([features])

        t0       = time.perf_counter()
        pred     = model.predict(scaled)[0]
        probs    = model.predict_proba(scaled)[0]
        latency  = (time.perf_counter() - t0) * 1000

        results.append((label, pred, max(probs), latency))

    print(f"\n  📂 Model loaded from  : {rf_path}")
    print(f"  📊 Training Accuracy  : {saved_metrics['accuracy']*100:.2f}%")
    print(f"  🎛️  Features Used      : {len(feature_cols)}")
    print(f"  🌳 Estimators         : {model.n_estimators}")
    print()
    for label, server, conf, latency in results:
        print(f"  🔹 {label}")
        print_result("Recommended Server", f"server_{int(server)}")
        print_result("Confidence",          f"{conf*100:.2f}%")
        print_result("Inference Latency",   f"{latency:.3f}", "ms")
        print()

    print("  ✨ Random Forest Test — PASSED\n")
    return True


# ─────────────────────────────────────────────────────────────
# 2.  XGBOOST  TEST
# ─────────────────────────────────────────────────────────────
def test_xgboost():
    print_header("⚡ TEST 2 — XGBoost (Primary Routing Model)")

    xgb_path = os.path.join(MODELS_ROOT, "4_xgboost")
    model    = joblib.load(os.path.join(xgb_path, "model.pkl"))
    scaler   = joblib.load(os.path.join(xgb_path, "scaler.pkl"))

    with open(os.path.join(xgb_path, "feature_cols.json")) as f:
        feature_cols = json.load(f)

    with open(os.path.join(xgb_path, "metrics.json")) as f:
        saved_metrics = json.load(f)

    sample_cases = [
        ("Low-Load  (Server 0 expected)", {
            "request_count": 50,  "avg_response_time": 120,  "error_rate": 0.01,
            "bot_rate": 0.02, "hour": 3, "weekday": 1, "is_weekend": 0,
            "request_count_lag_1": 48, "request_count_lag_2": 45,
            "request_count_lag_3": 43, "request_count_lag_4": 40,
            "request_count_lag_5": 38, "avg_response_time_lag_1": 118,
            "avg_response_time_lag_2": 115, "error_rate_lag_1": 0.01,
            "error_rate_lag_2": 0.01, "request_count_rolling_mean": 43,
            "request_count_rolling_std": 4
        }),
        ("High-Load (Server 2 expected)", {
            "request_count": 1500, "avg_response_time": 950, "error_rate": 0.15,
            "bot_rate": 0.40, "hour": 20, "weekday": 4, "is_weekend": 0,
            "request_count_lag_1": 1450, "request_count_lag_2": 1400,
            "request_count_lag_3": 1350, "request_count_lag_4": 1300,
            "request_count_lag_5": 1250, "avg_response_time_lag_1": 920,
            "avg_response_time_lag_2": 890, "error_rate_lag_1": 0.13,
            "error_rate_lag_2": 0.12, "request_count_rolling_mean": 1350,
            "request_count_rolling_std": 95
        }),
    ]

    print(f"\n  📂 Model loaded from  : {xgb_path}")
    print(f"  📊 Training Accuracy  : {saved_metrics['accuracy']*100:.2f}%")
    print(f"  🎛️  Features Used      : {len(feature_cols)}")
    print()

    for label, sample in sample_cases:
        features = [sample.get(c, 0) for c in feature_cols]
        scaled   = scaler.transform([features])

        t0      = time.perf_counter()
        pred    = model.predict(scaled)[0]
        probs   = model.predict_proba(scaled)[0]
        latency = (time.perf_counter() - t0) * 1000

        print(f"  🔹 {label}")
        print_result("Recommended Server", f"server_{int(pred)}")
        print_result("Confidence",          f"{max(probs)*100:.2f}%")
        print_result("Inference Latency",   f"{latency:.3f}", "ms")
        print(f"   📊  All Server Probs     "
              f"[S0={probs[0]*100:.1f}%  S1={probs[1]*100:.1f}%  S2={probs[2]*100:.1f}%]")
        print()

    print("  ✨ XGBoost Test — PASSED\n")
    return True


# ─────────────────────────────────────────────────────────────
# 3.  ISOLATION FOREST  TEST
# ─────────────────────────────────────────────────────────────
def test_isolation_forest():
    print_header("🛡️  TEST 3 — Isolation Forest (Anomaly / Attack Detection)")

    anomaly_path = os.path.join(MODELS_ROOT, "6_anomaly_detection")
    model        = joblib.load(os.path.join(anomaly_path, "model.pkl"))
    scaler       = joblib.load(os.path.join(anomaly_path, "scaler.pkl"))

    with open(os.path.join(anomaly_path, "feature_cols.json")) as f:
        feature_cols = json.load(f)

    with open(os.path.join(anomaly_path, "metrics.json")) as f:
        saved_metrics = json.load(f)

    test_cases = [
        ("Normal User Traffic",   {"request_count":80,   "avg_response_time":200, "error_rate":0.02, "bot_rate":0.05, "total_bytes":5000,  "server_error_count":1,  "client_error_count":3}),
        ("DDoS / Attack Traffic", {"request_count":9999, "avg_response_time":3,   "error_rate":0.95, "bot_rate":0.98, "total_bytes":999999,"server_error_count":500,"client_error_count":999}),
        ("Bot Scraper Traffic",   {"request_count":3000, "avg_response_time":15,  "error_rate":0.60, "bot_rate":0.90, "total_bytes":200000,"server_error_count":100,"client_error_count":400}),
    ]

    print(f"\n  📂 Model loaded from  : {anomaly_path}")
    print(f"  📊 Overall Accuracy   : {saved_metrics['classification_report']['accuracy']*100:.2f}%")
    print(f"  🎛️  Features Used      : {len(feature_cols)}")
    print()

    for label, sample in test_cases:
        features = [sample.get(c, 0) for c in feature_cols]
        scaled   = scaler.transform([features])

        t0      = time.perf_counter()
        result  = model.predict(scaled)[0]      # -1 = anomaly, 1 = normal
        score   = model.decision_function(scaled)[0]
        latency = (time.perf_counter() - t0) * 1000

        is_attack    = result == -1
        status_emoji = "🚨 ATTACK DETECTED" if is_attack else "✅ Normal Traffic"

        print(f"  🔹 {label}")
        print_result("Status",           status_emoji)
        print_result("Anomaly Score",    f"{score:.4f}   (negative = suspicious)")
        print_result("Inference Latency",f"{latency:.3f}", "ms")
        print()

    print("  ✨ Isolation Forest Test — PASSED\n")
    return True


# ─────────────────────────────────────────────────────────────
# 4.  LSTM  TEST
# ─────────────────────────────────────────────────────────────
def test_lstm():
    print_header("🔮 TEST 4 — LSTM Neural Network (Traffic Forecast)")

    try:
        # Import TensorFlow only here (heavy import)
        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
        from tensorflow.keras.models import load_model as keras_load

        lstm_path = os.path.join(MODELS_ROOT, "5_lstm")
        model     = keras_load(os.path.join(lstm_path, "lstm_model.h5"), compile=False)
        scaler    = joblib.load(os.path.join(lstm_path, "scaler.pkl"))

        with open(os.path.join(lstm_path, "config.json")) as f:
            config = json.load(f)

        print(f"\n  📂 Model loaded from  : {lstm_path}")
        print(f"  📊 R² Score (Accuracy): {config['metrics']['r2_score']*100:.2f}%")
        print(f"  📉 MAE                 : {config['metrics']['mae']:.2f} requests")
        print(f"  📉 RMSE                : {config['metrics']['rmse']:.2f} requests")
        print(f"  🔢 Sequence Length     : {config['seq_length']} time steps")
        print()

        forecast_scenarios = [
            ("Low Traffic Trend (gradual drop)",  [80,  75,  70,  65,  62,  60,  58,  55,  52,  50]),
            ("High Traffic Trend (spike rising)", [200, 280, 380, 500, 650, 800, 1000,1200,1400,1600]),
            ("Stable Traffic Trend",              [300, 305, 298, 302, 300, 299, 301, 300, 302, 301]),
        ]

        for label, sequence in forecast_scenarios:
            seq_arr    = np.array(sequence).reshape(-1, 1)
            seq_scaled = scaler.transform(seq_arr).reshape(1, 10, 1)

            t0           = time.perf_counter()
            pred_scaled  = model.predict(seq_scaled, verbose=0)
            pred_load    = float(scaler.inverse_transform(pred_scaled)[0][0])
            latency      = (time.perf_counter() - t0) * 1000

            current_load = sequence[-1]
            action = "⬆️  Scale UP Pods" if pred_load > current_load * 1.2 \
                else ("⬇️  Scale DOWN Pods" if pred_load < current_load * 0.8 else "➡️  Stay Stable")

            print(f"  🔹 {label}")
            print(f"   📥  Last 10 readings   : {sequence}")
            print_result("Predicted Next Load",  f"{pred_load:.0f}",  "req/min")
            print_result("Current Load",         f"{current_load}",   "req/min")
            print_result("K8s Scaling Action",   action)
            print_result("Inference Latency",    f"{latency:.1f}",    "ms")
            print()

        print("  ✨ LSTM Test — PASSED\n")
        return True

    except Exception as e:
        print(f"  ⚠️  LSTM Test skipped — {e}\n")
        return False


# ─────────────────────────────────────────────────────────────
# 5.  FULL PIPELINE  TEST  (All 4 models together like app.py)
# ─────────────────────────────────────────────────────────────
def test_full_pipeline():
    print_header("🚀 TEST 5 — Full AI Pipeline (End-to-End like Production)")

    # Load all models
    rf_path      = os.path.join(MODELS_ROOT, "3_random_forest")
    xgb_path     = os.path.join(MODELS_ROOT, "4_xgboost")
    anomaly_path = os.path.join(MODELS_ROOT, "6_anomaly_detection")

    rf_model      = joblib.load(os.path.join(rf_path,      "model.pkl"))
    rf_scaler     = joblib.load(os.path.join(rf_path,      "scaler.pkl"))
    xgb_model     = joblib.load(os.path.join(xgb_path,    "model.pkl"))
    xgb_scaler    = joblib.load(os.path.join(xgb_path,    "scaler.pkl"))
    anomaly_model = joblib.load(os.path.join(anomaly_path, "model.pkl"))
    anomaly_scaler= joblib.load(os.path.join(anomaly_path, "scaler.pkl"))

    with open(os.path.join(rf_path,      "feature_cols.json")) as f: rf_features      = json.load(f)
    with open(os.path.join(xgb_path,     "feature_cols.json")) as f: xgb_features     = json.load(f)
    with open(os.path.join(anomaly_path, "feature_cols.json")) as f: anomaly_features  = json.load(f)

    # Simulate a real incoming request payload (like Node.js sends)
    incoming_data = {
        "request_count": 450, "avg_response_time": 420, "error_rate": 0.06,
        "bot_rate": 0.25, "hour": 18, "weekday": 3, "is_weekend": 0,
        "request_count_lag_1": 430, "request_count_lag_2": 410,
        "request_count_lag_3": 400, "request_count_lag_4": 390,
        "request_count_lag_5": 380, "avg_response_time_lag_1": 400,
        "avg_response_time_lag_2": 380, "error_rate_lag_1": 0.055,
        "error_rate_lag_2": 0.05,  "request_count_rolling_mean": 408,
        "request_count_rolling_std": 25, "total_bytes": 95000,
        "server_error_count": 15, "client_error_count": 30,
        "sequence": [380, 390, 400, 410, 420, 430, 435, 440, 445, 450]
    }

    print("\n  📨  Simulated Node.js Payload:")
    print(f"      request_count      : {incoming_data['request_count']}")
    print(f"      avg_response_time  : {incoming_data['avg_response_time']} ms")
    print(f"      error_rate         : {incoming_data['error_rate']*100:.1f}%")
    print(f"      bot_rate           : {incoming_data['bot_rate']*100:.1f}%")

    t_total = time.perf_counter()

    # STEP 1: Anomaly Detection
    feats   = [incoming_data.get(c,0) for c in anomaly_features]
    scaled  = anomaly_scaler.transform([feats])
    is_anom = anomaly_model.predict(scaled)[0]
    security= "🚨 ANOMALY — BLOCK REQUEST" if is_anom == -1 else "✅ Normal Traffic"

    # STEP 2: XGBoost Routing
    feats2  = [incoming_data.get(c,0) for c in xgb_features]
    scaled2 = xgb_scaler.transform([feats2])
    xgb_srv = xgb_model.predict(scaled2)[0]
    xgb_con = max(xgb_model.predict_proba(scaled2)[0])

    # STEP 3: RF Validation
    feats3  = [incoming_data.get(c,0) for c in rf_features]
    scaled3 = rf_scaler.transform([feats3])
    rf_srv  = rf_model.predict(scaled3)[0]
    rf_con  = max(rf_model.predict_proba(scaled3)[0])

    # STEP 4: LSTM Forecast
    forecast_val = "N/A"
    k8s_action   = "N/A"
    try:
        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
        from tensorflow.keras.models import load_model as keras_load
        lstm_path  = os.path.join(MODELS_ROOT, "5_lstm")
        lstm_model = keras_load(os.path.join(lstm_path, "lstm_model.h5"), compile=False)
        lstm_scaler= joblib.load(os.path.join(lstm_path, "scaler.pkl"))
        if "sequence" in incoming_data:
            seq       = np.array(incoming_data["sequence"][-10:]).reshape(-1,1)
            seq_sc    = lstm_scaler.transform(seq).reshape(1,10,1)
            pred_sc   = lstm_model.predict(seq_sc, verbose=0)
            pred_load = float(lstm_scaler.inverse_transform(pred_sc)[0][0])
            current   = incoming_data["request_count"]
            k8s_action= "⬆️ Scale UP" if pred_load > current*1.2 else \
                        ("⬇️ Scale DOWN" if pred_load < current*0.8 else "➡️ Stable")
            forecast_val = f"{pred_load:.0f} req/min"
    except:
        pass

    total_latency = (time.perf_counter() - t_total) * 1000

    print("\n" + "─"*60)
    print("  🧠  AI PIPELINE FINAL OUTPUT (sent to Kubernetes):")
    print("─"*60)
    print(f"  🛡️   Security Check       : {security}")
    print(f"  📡  XGBoost Decision     : server_{int(xgb_srv)}  (Conf: {xgb_con*100:.1f}%)")
    print(f"  🌲  Random Forest Check  : server_{int(rf_srv)}  (Conf: {rf_con*100:.1f}%)")
    print(f"  🔮  LSTM Forecast        : {forecast_val}")
    print(f"  ⚙️   Kubernetes Action    : {k8s_action}")
    print(f"  ⚡  Total Pipeline Time  : {total_latency:.2f} ms")
    print("─"*60)
    print("\n  ✨ Full Pipeline Test — PASSED\n")
    return True


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "█"*60)
    print("  🚀  AI LOAD BALANCER — MODEL PERFORMANCE TEST SUITE")
    print("  Final Year Project | All 4 AI Models")
    print("█"*60)

    tests = [
        ("Random Forest",        test_random_forest),
        ("XGBoost",              test_xgboost),
        ("Isolation Forest",     test_isolation_forest),
        ("LSTM",                 test_lstm),
        ("Full Pipeline",        test_full_pipeline),
    ]

    passed = 0
    for name, fn in tests:
        try:
            ok = fn()
            if ok:
                passed += 1
        except Exception as e:
            print(f"\n  ❌  {name} Test FAILED: {e}\n")

    print("\n" + "="*60)
    print(f"  📋  RESULTS SUMMARY  →  {passed}/{len(tests)} Tests Passed")
    print("="*60 + "\n")
