from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Check if model exists
MODEL_PATH  = os.path.join(os.path.dirname(__file__), "models", "disease_model.pkl")
model_loaded = False

if os.path.exists(MODEL_PATH):
    from src.predict import predict
    model_loaded = True
    print("✅ ML Model loaded successfully!")
else:
    print("⚠️  Model not found. Please run: python src/train_model.py")

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message":      "HealthAI ML Service Running ✅",
        "model_loaded": model_loaded,
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "running", "model_loaded": model_loaded })

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

        result = predict(
            symptoms=symptoms,
            age=age,
            gender=gender,
            blood_pressure=blood_pressure,
            cholesterol=cholesterol,
            duration=duration,
        )

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