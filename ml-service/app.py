from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import subprocess
import sys
import joblib
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)

# Check if disease model exists
MODEL_PATH  = os.path.join(os.path.dirname(__file__), "models", "disease_model.pkl")
model_loaded = False
disease_load_error = None
predict = None


def load_disease_predictor():
    """
    Load disease predictor. If model files are incompatible with current sklearn,
    retrain once on startup and load again.
    """
    global model_loaded, disease_load_error, predict

    try:
        from src.predict import predict as disease_predict
        predict = disease_predict
        model_loaded = True
        disease_load_error = None
        print("✅ Disease ML Model loaded successfully!")
        return
    except Exception as first_error:
        print(f"⚠️  Disease model load failed: {first_error}")
        print("🔄 Attempting auto-retrain for disease model...")

    try:
        from src.train_model import train as train_disease_model
        train_disease_model()

        from src.predict import predict as disease_predict
        predict = disease_predict
        model_loaded = True
        disease_load_error = None
        print("✅ Disease model retrained and loaded successfully!")
    except Exception as retrain_error:
        model_loaded = False
        disease_load_error = str(retrain_error)
        print(f"❌ Disease model unavailable after retrain attempt: {retrain_error}")
        traceback.print_exc()

if os.path.exists(MODEL_PATH):
    load_disease_predictor()
else:
    print("⚠️  Disease model not found. Please run: python src/train_model.py")

# Check if health models exist (genai-ml models)
GENAI_ML_DIR = os.path.join(os.path.dirname(__file__), "genai-ml")
HEALTH_MODELS = {
    "weight": os.path.join(GENAI_ML_DIR, "weight_model.pkl"),
    "obesity": os.path.join(GENAI_ML_DIR, "obesity_model.pkl"),
    "health_score": os.path.join(GENAI_ML_DIR, "health_score_model.pkl"),
}

health_models_loaded = False
weight_model = None
obesity_model = None
score_model = None

def _load_health_models_from_disk():
    global weight_model, obesity_model, score_model, health_models_loaded

    try:
        weight_model = joblib.load(HEALTH_MODELS["weight"])
        obesity_model = joblib.load(HEALTH_MODELS["obesity"])
        score_model = joblib.load(HEALTH_MODELS["health_score"])
        return True
    except Exception as e:
        print(f"⚠️  Error loading health models: {e}")
        return False


def _train_health_models():
    print("🔄 Training health models...")
    result = subprocess.run(
        [sys.executable, "train_model.py"],
        cwd=GENAI_ML_DIR,
        capture_output=True,
        text=True,
    )
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        raise RuntimeError(f"Health model training failed with code {result.returncode}")


def _validate_health_models():
    """Run a tiny smoke test to catch sklearn pickle compatibility issues early."""
    sample_features = [[25, 1, 170.0, 70.0, 24.2, 7, 3, 0, 1, 0, 0]]
    weight_model.predict(sample_features)[0]
    obesity_model.predict(sample_features)[0]
    score_model.predict(sample_features)[0]


def load_health_models(force_retrain=False):
    global health_models_loaded

    if force_retrain:
        _train_health_models()

    if not all(os.path.exists(path) for path in HEALTH_MODELS.values()):
        print("⚠️  Health models not found. Please run: python -m genai_ml.train_model")
        health_models_loaded = False
        return

    if not _load_health_models_from_disk():
        print("🔄 Attempting auto-retrain for health models...")
        _train_health_models()
        if not _load_health_models_from_disk():
            health_models_loaded = False
            return

    try:
        _validate_health_models()
        health_models_loaded = True
        print("✅ Health Models (genai-ml) loaded successfully!")
    except Exception as validation_error:
        print(f"⚠️  Health model validation failed: {validation_error}")
        print("🔄 Attempting auto-retrain for health models...")
        _train_health_models()
        if not _load_health_models_from_disk():
            health_models_loaded = False
            return

        _validate_health_models()
        health_models_loaded = True
        print("✅ Health Models retrained and loaded successfully!")


load_health_models()

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message":      "HealthAI ML Service Running ✅",
        "model_loaded": model_loaded,
        "disease_load_error": disease_load_error,
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({ 
        "status": "running", 
        "disease_model_loaded": model_loaded,
        "health_models_loaded": health_models_loaded,
        "disease_load_error": disease_load_error,
    })

@app.route("/predict/health", methods=["POST"])
def predict_health():
    """
    Predict health metrics: weight, obesity risk, and health score
    Replaces the old genai-ml subprocess approach
    """
    try:
        if not health_models_loaded:
            return jsonify({ 
                "error": "Health models not loaded. Ensure genai-ml models exist in ml-service/genai-ml/" 
            }), 503

        data = request.get_json()
        if not data:
            return jsonify({ "error": "No data provided" }), 400

        height_cm = float(data.get("height", 0) or 0)
        weight_kg = float(data.get("weight", 0) or 0)
        height_m = height_cm / 100 if height_cm > 0 else 0
        bmi = (weight_kg / (height_m * height_m)) if height_m > 0 else 0

        # Extract features
        features = [[
            data.get("age", 0),
            data.get("gender", 0),
            height_cm,
            weight_kg,
            bmi,
            data.get("sleep", 0),
            data.get("exercise", 0),
            data.get("smoker", 0),
            data.get("alcohol", 0),
            data.get("diabetic", 0),
            data.get("heart_disease", 0)
        ]]

        # Get predictions
        try:
            predicted_weight = weight_model.predict(features)[0]
            obesity = obesity_model.predict(features)[0]
            health_score = score_model.predict(features)[0]
        except Exception as predict_error:
            print(f"⚠️  Health prediction failed: {predict_error}")
            if "monotonic_cst" in str(predict_error):
                print("🔄 Rebuilding health models due to sklearn compatibility issue...")
                load_health_models(force_retrain=True)
                predicted_weight = weight_model.predict(features)[0]
                obesity = obesity_model.predict(features)[0]
                health_score = score_model.predict(features)[0]
            else:
                raise

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

        print(f"✅ Health Prediction: Weight={predicted_weight:.2f}, Obesity={labels[int(obesity)]}, Score={health_score:.2f}")
        return jsonify(result)

    except Exception as e:
        print(f"❌ Error in health prediction: {str(e)}")
        return jsonify({ "error": str(e) }), 500

@app.route("/predict", methods=["POST"])
def predict_disease():
    try:
        if not model_loaded:
            return jsonify({ "error": "Model not loaded. Run: python src/train_model.py" }), 503

        data = request.get_json()
        if not data:
            return jsonify({ "error": "No data provided" }), 400

        symptoms       = data.get("symptoms", [])
        age            = data.get("age", 25)
        gender         = data.get("gender", "Male")
        blood_pressure = data.get("blood_pressure", "Normal")
        cholesterol    = data.get("cholesterol", "Normal")

        if not symptoms:
            return jsonify({ "error": "Please provide at least one symptom" }), 400

        duration = data.get("duration", "")

        try:
            result = predict(
                symptoms=symptoms,
                age=age,
                gender=gender,
                blood_pressure=blood_pressure,
                cholesterol=cholesterol,
                duration=duration,
            )
        except Exception as predict_error:
            print(f"⚠️  Disease prediction failed: {predict_error}")
            if "monotonic_cst" in str(predict_error):
                print("🔄 Rebuilding disease model due to sklearn compatibility issue...")
                load_disease_predictor()
                result = predict(
                    symptoms=symptoms,
                    age=age,
                    gender=gender,
                    blood_pressure=blood_pressure,
                    cholesterol=cholesterol,
                    duration=duration,
                )
            else:
                raise

        print(f"✅ Prediction: {result['disease']} | Risk: {result['risk_level']} | Confidence: {result['confidence']}%")
        return jsonify(result)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({ "error": str(e) }), 500

@app.route("/diseases", methods=["GET"])
def get_diseases():
    try:
        if not model_loaded:
            return jsonify({ "error": "Model not loaded" }), 503
        from src.predict import le
        diseases = le.classes_.tolist()
        return jsonify({ "diseases": diseases, "total": len(diseases) })
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

@app.route("/symptoms", methods=["GET"])
def get_symptoms():
    try:
        if not model_loaded:
            return jsonify({ "error": "Model not loaded" }), 503
        from src.predict import feature_cols
        return jsonify({ "symptoms": feature_cols, "total": len(feature_cols) })
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 5001))
    print(f"🚀 ML Service starting on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=True)