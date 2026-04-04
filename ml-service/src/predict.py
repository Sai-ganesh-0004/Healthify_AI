import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import numpy as np

# Paths
MODEL_PATH    = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "disease_model.pkl")
ENCODER_PATH  = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "label_encoder.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "feature_cols.pkl")
DESC_PATH     = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "descriptions.pkl")
PREC_PATH     = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "precautions.pkl")

# Load models
model        = joblib.load(MODEL_PATH)
le           = joblib.load(ENCODER_PATH)
feature_cols = joblib.load(FEATURES_PATH)
desc_df      = joblib.load(DESC_PATH)
prec_df      = joblib.load(PREC_PATH)

print("✅ All models and encoders loaded!")

# ── Synonym map — maps user typed words to exact dataset symptom names ──
SYNONYMS = {
    "itching":                      ["itch", "itching", "itchy", "skin itch"],
    "skin_rash":                    ["rash", "skin rash", "rashes", "skin eruption"],
    "continuous_sneezing":          ["sneezing", "sneeze", "continuous sneezing"],
    "shivering":                    ["shivering", "shiver", "trembling"],
    "chills":                       ["chills", "cold chills", "feeling cold"],
    "joint_pain":                   ["joint pain", "joint ache", "joints pain", "arthritis"],
    "stomach_pain":                 ["stomach pain", "stomach ache", "tummy pain", "belly pain"],
    "acidity":                      ["acidity", "acid reflux", "heartburn", "burning sensation"],
    "vomiting":                     ["vomiting", "vomit", "throwing up", "puking"],
    "fatigue":                      ["fatigue", "tired", "tiredness", "exhausted", "weakness", "lethargy", "weak"],
    "weight_gain":                  ["weight gain", "gaining weight"],
    "anxiety":                      ["anxiety", "anxious", "nervous", "worry", "panic"],
    "mood_swings":                  ["mood swings", "mood change", "emotional"],
    "weight_loss":                  ["weight loss", "losing weight", "unexplained weight loss"],
    "restlessness":                 ["restlessness", "restless", "cant sit still"],
    "lethargy":                     ["lethargy", "lethargic", "sluggish", "no energy"],
    "cough":                        ["cough", "coughing", "dry cough", "wet cough"],
    "high_fever":                   ["high fever", "very high temperature", "severe fever", "104 fever", "fever", "temperature"],
    "mild_fever":                   ["mild fever", "low grade fever", "slight fever", "fever", "temperature"],
    "breathlessness":               ["breathlessness", "shortness of breath", "difficulty breathing", "cant breathe", "breathing problem"],
    "sweating":                     ["sweating", "excessive sweating", "night sweats", "sweat"],
    "dehydration":                  ["dehydration", "dehydrated", "not drinking water"],
    "indigestion":                  ["indigestion", "upset stomach", "bloating"],
    "headache":                     ["headache", "head pain", "head ache", "migraine", "head hurts"],
    "yellowish_skin":               ["yellow skin", "yellowish skin", "jaundice"],
    "dark_urine":                   ["dark urine", "brown urine", "dark colored urine"],
    "nausea":                       ["nausea", "nauseous", "feeling sick", "queasy", "feel like vomiting"],
    "loss_of_appetite":             ["loss of appetite", "no appetite", "not hungry", "poor appetite", "not eating"],
    "back_pain":                    ["back pain", "lower back pain", "backache", "upper back pain"],
    "constipation":                 ["constipation", "no bowel movement", "hard stool"],
    "abdominal_pain":               ["abdominal pain", "abdomen pain", "lower abdomen", "stomach cramps"],
    "diarrhoea":                    ["diarrhea", "diarrhoea", "loose stools", "loose motion", "watery stool"],
    "mild_fever":                   ["mild fever", "low grade fever", "slight fever", "fever"],
    "yellowing_of_eyes":            ["yellow eyes", "yellowing of eyes", "jaundice eyes"],
    "blurred_and_distorted_vision": ["blurred vision", "blurry vision", "vision problem", "cant see clearly"],
    "phlegm":                       ["phlegm", "mucus", "sputum", "thick mucus"],
    "throat_irritation":            ["throat irritation", "throat discomfort", "sore throat", "throat pain", "throat ache", "scratchy throat"],
    "runny_nose":                   ["runny nose", "runny", "nasal discharge", "stuffy nose", "blocked nose"],
    "congestion":                   ["congestion", "nasal congestion", "blocked", "stuffy"],
    "chest_pain":                   ["chest pain", "chest tightness", "chest discomfort", "chest pressure"],
    "fast_heart_rate":              ["fast heart rate", "palpitations", "heart racing", "rapid heartbeat"],
    "neck_pain":                    ["neck pain", "stiff neck", "neck ache"],
    "dizziness":                    ["dizziness", "dizzy", "lightheaded", "vertigo", "feeling faint"],
    "cramps":                       ["cramps", "muscle cramps", "leg cramps"],
    "bruising":                     ["bruising", "bruise", "easy bruising"],
    "swollen_legs":                 ["swollen legs", "leg swelling", "swelling in legs"],
    "knee_pain":                    ["knee pain", "knee ache", "pain in knee"],
    "hip_joint_pain":               ["hip pain", "hip joint pain", "pain in hip"],
    "muscle_weakness":              ["muscle weakness", "weak muscles", "muscle fatigue"],
    "loss_of_balance":              ["loss of balance", "balance problem", "unsteady"],
    "loss_of_smell":                ["loss of smell", "cant smell", "no smell"],
    "depression":                   ["depression", "depressed", "sadness", "low mood", "feeling hopeless"],
    "irritability":                 ["irritability", "irritable", "easily angry", "frustrated"],
    "muscle_pain":                  ["muscle pain", "muscle ache", "body ache", "body pain", "myalgia"],
    "palpitations":                 ["palpitations", "heart pounding", "heart fluttering"],
    "skin_peeling":                 ["skin peeling", "peeling skin", "flaky skin"],
    "blister":                      ["blister", "blisters", "skin blister"],
    "polyuria":                     ["frequent urination", "polyuria", "urinating a lot", "urination"],
    "excessive_hunger":             ["excessive hunger", "always hungry", "increased appetite"],
    "irregular_sugar_level":        ["irregular sugar", "blood sugar problem", "sugar level"],
    "lack_of_concentration":        ["lack of concentration", "cant focus", "brain fog", "poor memory"],
    "visual_disturbances":          ["visual disturbances", "vision changes", "seeing things"],
    "stiff_neck":                   ["stiff neck", "neck stiffness", "cant move neck"],
    "red_spots_over_body":          ["red spots", "red marks", "spots on body"],
    "watering_from_eyes":           ["watering eyes", "teary eyes", "eye discharge"],
    "redness_of_eyes":              ["red eyes", "redness of eyes", "pink eye"],
    "nodal_skin_eruptions":         ["skin nodules", "skin bumps", "nodal eruptions"],
    "pain_behind_the_eyes":         ["pain behind eyes", "eye pain", "eyes hurting"],
    "weakness_in_limbs":            ["weakness in limbs", "weak arms", "weak legs", "limb weakness"],
    "swelling_joints":              ["swelling joints", "swollen joints", "joint swelling"],
    "spinning_movements":           ["spinning", "room spinning", "vertigo"],
    "unsteadiness":                 ["unsteadiness", "unsteady", "wobbly"],
    "passage_of_gases":             ["gas", "flatulence", "bloating gas", "passage of gas"],
    "internal_itching":             ["internal itching", "internal itch"],
    "stomach_bleeding":             ["stomach bleeding", "blood in stool", "internal bleeding"],
    "blood_in_sputum":              ["blood in sputum", "coughing blood", "bloody cough"],
    "pain_during_bowel_movements":  ["pain during bowel", "painful bowel", "pain while passing stool"],
    "obesity":                      ["obesity", "obese", "overweight"],
    "enlarged_thyroid":             ["enlarged thyroid", "thyroid problem", "goiter"],
    "brittle_nails":                ["brittle nails", "weak nails", "breaking nails"],
    "cold_hands_and_feets":         ["cold hands", "cold feet", "cold extremities"],
    "sunken_eyes":                  ["sunken eyes", "hollow eyes", "deep set eyes"],
    "malaise":                      ["malaise", "general discomfort", "feeling unwell", "unwell"],
    "swelled_lymph_nodes":          ["swollen lymph nodes", "swelled glands", "lymph nodes"],
}

# ── Diet suggestions ──
DIET_SUGGESTIONS = {
    "diabetes":      ["Whole grains", "Leafy vegetables", "Low sugar fruits", "Nuts", "Legumes"],
    "hypertension":  ["Low sodium foods", "Bananas", "Beets", "Oats", "Berries"],
    "influenza":     ["Warm soups", "Ginger tea", "Citrus fruits", "Honey water", "Broth"],
    "common cold":   ["Vitamin C foods", "Warm liquids", "Garlic", "Ginger", "Honey"],
    "malaria":       ["Fluids", "Fruits", "Light meals", "Electrolytes", "Avoid spicy food"],
    "dengue":        ["Papaya leaf juice", "Coconut water", "Pomegranate juice", "Fluids"],
    "typhoid":       ["Boiled water", "Soft diet", "Bananas", "Boiled potatoes"],
    "tuberculosis":  ["High protein diet", "Eggs", "Milk", "Fruits", "Vegetables"],
    "pneumonia":     ["Warm soups", "Honey", "Turmeric milk", "Fruits", "Fluids"],
    "hepatitis":     ["Low fat diet", "Fresh fruits", "Vegetables", "Avoid alcohol"],
    "migraine":      ["Magnesium rich foods", "Nuts", "Seeds", "Avoid caffeine"],
    "allergy":       ["Anti-inflammatory foods", "Turmeric", "Ginger", "Green tea"],
    "default":       ["Balanced diet", "Plenty of water", "Fresh fruits", "Green vegetables"],
}

def get_diet(disease):
    for key in DIET_SUGGESTIONS:
        if key in disease.lower():
            return DIET_SUGGESTIONS[key]
    return DIET_SUGGESTIONS["default"]

def get_risk_level(disease, confidence=100):
    if confidence < 25:
        return "Low"

    high_risk   = ["cancer", "stroke", "heart attack", "tuberculosis", "hiv", "hepatitis",
                   "diabetes", "paralysis", "malaria", "typhoid", "dengue", "pneumonia", "sepsis"]
    medium_risk = ["hypertension", "asthma", "kidney", "liver", "epilepsy",
                   "migraine", "thyroid", "gastroenteritis", "allergy", "bronchitis"]
    dl = disease.lower()
    for d in high_risk:
        if d in dl:
            return "Medium" if confidence < 45 else "High"
    for d in medium_risk:
        if d in dl: return "Medium"
    return "Low"

def get_description(disease):
    try:
        row = desc_df[desc_df["Disease"].str.strip().str.lower() == disease.lower()]
        if not row.empty:
            return row.iloc[0]["Description"]
    except: pass
    return f"You may be experiencing symptoms of {disease}. Please consult a doctor for proper diagnosis."

def get_precautions(disease):
    try:
        row = prec_df[prec_df["Disease"].str.strip().str.lower() == disease.lower()]
        if not row.empty:
            prec_cols   = [col for col in prec_df.columns if col.startswith("Precaution_")]
            precautions = [row.iloc[0][col] for col in prec_cols if str(row.iloc[0][col]) != "nan"]
            return precautions
    except: pass
    return ["Consult a doctor", "Rest well", "Stay hydrated", "Monitor symptoms"]

def match_symptom(feature, user_symptoms):
    """Match user typed symptom to dataset feature name"""
    feature_clean  = feature.strip().lower().replace("_", " ")
    symptoms_lower = [s.strip().lower() for s in user_symptoms]

    # Direct match
    for s in symptoms_lower:
        if s in feature_clean or feature_clean in s:
            return True

    # Synonym match
    if feature in SYNONYMS:
        for synonym in SYNONYMS[feature]:
            for s in symptoms_lower:
                if synonym in s or s in synonym:
                    return True
    return False


# ── Age based disease likelihood adjustment ──
AGE_DISEASE_MAP = {
    # Children (0-12)
    "child": ["Common Cold", "Chickenpox", "Measles", "Mumps", "Allergy",
              "Asthma", "Dengue Fever", "Malaria", "Typhoid Fever"],
    # Teenagers (13-19)
    "teen":  ["Acne", "Allergy", "Anxiety Disorders", "Asthma", "Common Cold",
              "Depression", "Dengue Fever", "Influenza", "Migraine"],
    # Young adults (20-35)
    "young": ["Anxiety Disorders", "Depression", "Migraine", "Gastroenteritis",
              "Dengue Fever", "Typhoid Fever", "Malaria", "Influenza", "Allergy"],
    # Middle aged (36-55)
    "middle": ["Hypertension", "Diabetes", "Migraine", "Hypertensive Heart Disease",
               "Hypothyroidism", "Hyperthyroidism", "Gastroenteritis", "Kidney Disease",
               "Common Cold", "Influenza", "Bronchitis", "Allergy", "Sinusitis"],
    # Senior (56+)
    "senior": ["Hypertension", "Diabetes", "Coronary Artery Disease", "Osteoarthritis",
               "Chronic Kidney Disease", "Stroke", "Alzheimer's Disease", "Dementia",
               "Parkinson's Disease", "Cataracts", "Osteoporosis", "Pneumonia"],
}

# ── Duration based risk adjustment ──
DURATION_RISK_MAP = {
    "1day":    "Low",
    "2-3days": "Medium",
    "1week":   "Medium",
    "2weeks+": "High",
}

def get_age_group(age):
    age = int(age) if age else 25
    if age <= 12:   return "child"
    elif age <= 19: return "teen"
    elif age <= 35: return "young"
    elif age <= 55: return "middle"
    else:           return "senior"

def adjust_prediction_by_age(proba, age):
    """Boost probability of age-appropriate diseases"""
    proba = proba.copy()
    age_group = get_age_group(age)
    likely_diseases = AGE_DISEASE_MAP.get(age_group, [])

    for i, encoded_label in enumerate(model.classes_):
        encoded_label = int(encoded_label)
        if 0 <= encoded_label < len(le.classes_):
            disease_name = str(le.classes_[encoded_label])
        else:
            disease_name = f"Disease_{encoded_label}"

        for likely in likely_diseases:
            if likely.lower() in disease_name.lower():
                proba[i] *= 1.3  # boost by 30%

    # Renormalize
    total = proba.sum()
    if total > 0:
        proba = proba / total
    return proba

def get_duration_advice(duration, disease, base_advice):
    """Customize advice based on symptom duration"""
    if duration == "1day":
        return f"{base_advice} Since symptoms started recently, monitor closely for the next 24-48 hours."
    elif duration == "2-3days":
        return f"{base_advice} Symptoms lasting 2-3 days warrant attention. Consult a doctor if no improvement."
    elif duration == "1week":
        return f"{base_advice} Symptoms persisting for a week require medical evaluation. Please see a doctor soon."
    elif duration == "2weeks+":
        return f"{base_advice} Symptoms lasting more than 2 weeks are concerning. Immediate medical consultation is strongly recommended."
    return base_advice

def predict(symptoms, age=25, gender="Male", blood_pressure="Normal", cholesterol="Normal", duration=""):
    # Build input vector
    input_vector = [1 if match_symptom(col, symptoms) else 0 for col in feature_cols]
    input_array  = np.array([input_vector])

    # Get base probabilities
    proba = model.predict_proba(input_array)[0]

    # Adjust probabilities based on age
    proba = adjust_prediction_by_age(proba, age)

    # Get final prediction
    prediction = np.argmax(proba)
    pred_label = int(model.classes_[prediction])
    if 0 <= pred_label < len(le.classes_):
        disease = str(le.classes_[pred_label])
    else:
        disease = f"Disease_{pred_label}"

    confidence = round(max(proba) * 100, 2)

    # Top 3 possible diseases
    top3_idx      = np.argsort(proba)[-3:][::-1]
    top3_diseases = [
        {
            "disease": str(le.classes_[int(model.classes_[i])])
            if 0 <= int(model.classes_[i]) < len(le.classes_)
            else f"Disease_{int(model.classes_[i])}",
            "confidence": round(proba[i] * 100, 2),
        }
        for i in top3_idx
    ]

    symptoms_lower = [str(s).strip().lower() for s in symptoms]
    has = lambda words: any(any(w in s for w in words) for s in symptoms_lower)

    is_common_viral_pattern = (
        has(["fever", "temperature"]) and
        has(["cough"]) and
        has(["fatigue", "tired", "weak", "weakness"]) and
        not has(["blood", "coughing blood", "chest pain", "shortness of breath", "breathless", "difficulty breathing"])
    )

    if is_common_viral_pattern:
        disease = "Common Cold / Viral Fever"
        confidence = round(max(confidence, 72.0), 2)
        risk_level = "Medium" if duration in ["1week", "2weeks+"] else "Low"
        description = "Symptoms are most consistent with a common viral fever/cold pattern. Rest, hydration, and symptomatic care are usually enough unless symptoms worsen."
        precautions = [
            "Rest well for 2-3 days",
            "Drink warm fluids regularly",
            "Take paracetamol for fever if needed",
            "Monitor breathing and high fever",
            "Consult doctor if symptoms persist or worsen",
        ]
        diet = ["Warm soups", "Ginger tea", "Citrus fruits", "Honey water", "Light meals"]
    else:
        if confidence < 25:
            disease = "Inconclusive (low confidence)"

        # Get risk level — also consider duration
        risk_level  = get_risk_level(disease, confidence)
        duration_risk = DURATION_RISK_MAP.get(duration, "")

        # Escalate risk if duration is long
        if duration_risk == "High" and risk_level == "Low":
            risk_level = "Medium"
        elif duration_risk == "High" and risk_level == "Medium":
            risk_level = "High"

        description = get_description(disease)
        precautions = get_precautions(disease)
        diet        = get_diet(disease)

    # Customize advice based on age and duration
    age_group = get_age_group(age)
    if age_group == "child":
        description = f"For children: {description}"
    elif age_group == "senior":
        description = f"For elderly patients, extra care is advised. {description}"

    description = get_duration_advice(duration, disease, description)

    matched_symptoms = [col for col in feature_cols if match_symptom(col, symptoms)]
    print(f"✅ Disease: {disease} | Age: {age} ({age_group}) | Duration: {duration} | Risk: {risk_level}")

    return {
        "disease":          disease,
        "risk_level":       risk_level,
        "confidence":       confidence,
        "advice":           description,
        "precautions":      precautions,
        "diet":             diet,
        "top3":             top3_diseases,
        "matched_symptoms": matched_symptoms,
        "age_group":        age_group,
    }