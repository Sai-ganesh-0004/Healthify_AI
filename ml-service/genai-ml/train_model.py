import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
# This script runs from ml-service root, so data is in data/lifestyle.csv
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "lifestyle.csv")
data = pd.read_csv(DATA_PATH)

# Encode categorical variables
data["Gender"] = data["Gender"].map({"Male": 1, "Female": 0})
data["Smoker"] = data["Smoker"].map({"Yes": 1, "No": 0})
data["Diabetic"] = data["Diabetic"].map({"Yes": 1, "No": 0})
data["Heart_Disease"] = data["Heart_Disease"].map({"Yes": 1, "No": 0})

# Create BMI category
def bmi_category(bmi):
    if bmi < 18.5:
        return 0
    elif bmi < 25:
        return 1
    elif bmi < 30:
        return 2
    else:
        return 3

data["Obesity_Category"] = data["BMI"].apply(bmi_category)

# Create Health Score
def health_score(row):
    score = 10
    if row["BMI"] > 25:
        score -= 2
    if row["Exercise_Hours_per_Week"] < 2:
        score -= 2
    if row["Hours_of_Sleep"] < 6:
        score -= 1
    if row["Smoker"] == 1:
        score -= 2
    if row["Heart_Disease"] == 1:
        score -= 2
    return score

data["Health_Score"] = data.apply(health_score, axis=1)

# Features used for all models
features = [
    "Age",
    "Gender",
    "Height_cm",
    "Weight_kg",
    "BMI",
    "Hours_of_Sleep",
    "Exercise_Hours_per_Week",
    "Smoker",
    "Alcohol_Consumption_per_Week",
    "Diabetic",
    "Heart_Disease"
]

X = data[features]

# -------------------------
# Model 1: Weight Prediction
# -------------------------
y_weight = data["Weight_kg"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y_weight, test_size=0.2, random_state=42
)

weight_model = RandomForestRegressor(
    n_estimators=300,
    random_state=42,
)
weight_model.fit(X_train, y_train)

MODEL_DIR = os.path.dirname(__file__)
joblib.dump(weight_model, os.path.join(MODEL_DIR, "weight_model.pkl"))

print("Weight model trained")

# -------------------------
# Model 2: Obesity Classifier
# -------------------------
y_obesity = data["Obesity_Category"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y_obesity, test_size=0.2, random_state=42
)

obesity_model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced"
)
obesity_model.fit(X_train, y_train)

y_pred = obesity_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Obesity model accuracy: {accuracy * 100:.2f}%")

MODEL_DIR = os.path.dirname(__file__)
joblib.dump(obesity_model, os.path.join(MODEL_DIR, "obesity_model.pkl"))

print("Obesity model trained")

# -------------------------
# Model 3: Health Score
# -------------------------
y_score = data["Health_Score"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y_score, test_size=0.2, random_state=42
)

score_model = RandomForestRegressor(
    n_estimators=300,
    random_state=42,
)
score_model.fit(X_train, y_train)

MODEL_DIR = os.path.dirname(__file__)
joblib.dump(score_model, os.path.join(MODEL_DIR, "health_score_model.pkl"))

print("Health score model trained")

print("All models saved successfully")