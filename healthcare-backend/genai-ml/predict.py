import joblib
import sys
import json

# Load models
weight_model = joblib.load("weight_model.pkl")
obesity_model = joblib.load("obesity_model.pkl")
score_model = joblib.load("health_score_model.pkl")

input_data = json.loads(sys.argv[1])

features = [[
    input_data["age"],
    input_data["gender"],
    input_data["height"],
    input_data["weight"],
    input_data["sleep"],
    input_data["exercise"],
    input_data["smoker"],
    input_data["alcohol"],
    input_data["diabetic"],
    input_data["heart_disease"]
]]

# Predictions
predicted_weight = weight_model.predict(features)[0]
obesity = obesity_model.predict(features)[0]
health_score = score_model.predict(features)[0]

labels = {
    0: "Underweight",
    1: "Normal",
    2: "Overweight",
    3: "Obese"
}

result = {
    "predicted_weight": round(predicted_weight, 2),
    "obesity_risk": labels[int(obesity)],
    "health_score": round(health_score, 2)
}

print(json.dumps(result))