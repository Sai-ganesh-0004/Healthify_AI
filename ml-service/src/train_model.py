import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from src.preprocess import load_and_preprocess

# Paths
DATA_DIR      = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODEL_PATH    = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "disease_model.pkl")
ENCODER_PATH  = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "label_encoder.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "feature_cols.pkl")
DESC_PATH     = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "descriptions.pkl")
PREC_PATH     = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "precautions.pkl")

def train():
    print("🔄 Loading and preprocessing data...")
    X, y, le, feature_cols, desc_df, prec_df, severity_df = load_and_preprocess(DATA_DIR)

    print("🔄 Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("🔄 Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_train_pred = model.predict(X_train)
    train_accuracy = accuracy_score(y_train, y_train_pred)
    print(f"✅ Train Accuracy: {train_accuracy * 100:.2f}%")

    y_test_pred = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_test_pred)
    print(f"✅ Test Accuracy: {test_accuracy * 100:.2f}%")

    # Save everything
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model,        MODEL_PATH)
    joblib.dump(le,           ENCODER_PATH)
    joblib.dump(feature_cols, FEATURES_PATH)
    joblib.dump(desc_df,      DESC_PATH)
    joblib.dump(prec_df,      PREC_PATH)

    print(f"✅ Model saved!")
    print(f"✅ Training complete!")

if __name__ == "__main__":
    train()