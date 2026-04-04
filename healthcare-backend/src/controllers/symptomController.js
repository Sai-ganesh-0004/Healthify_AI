const axios = require("axios");
const Symptom = require("../models/Symptom");

// @POST /api/symptoms/predict
const predictSymptoms = async (req, res) => {
  try {
    const { symptoms, age, duration } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: "Please provide at least one symptom" });
    }

    let prediction;

    // Try calling Python ML service
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        { symptoms, age, duration },
        { timeout: 10000 }
      );
      // Override ML prediction with practical disease mapping
      prediction = getSmartPrediction(symptoms, mlResponse.data);
    } catch (mlError) {
      console.log("ML service unavailable, using fallback prediction");
      prediction = getFallbackPrediction(symptoms);
    }

    // Save symptom record
    const symptomRecord = await Symptom.create({
      user: req.user._id,
      symptoms,
      age,
      duration,
      prediction,
    });

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/symptoms/history
const getSymptomHistory = async (req, res) => {
  try {
    const history = await Symptom.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Smart prediction — maps symptom combos to practical common diseases
const getSmartPrediction = (symptoms, mlData) => {
  const s = symptoms.map(x => x.toLowerCase().trim());

  const has = (...words) => words.some(w => s.some(x => x.includes(w)));

  // ── HIGH RISK ──
  if (has("chest pain","chest tightness") && has("palpitation","heart racing","left arm"))
    return buildResult("Heart Attack / Cardiac Issue", "High", 88,
      ["Call emergency services immediately","Chew aspirin if available","Do not exert yourself","Lie down and stay calm"],
      "Chest pain with palpitations may indicate a serious cardiac event. Call emergency services immediately.",
      ["Low sodium foods","Omega-3 rich foods","Fresh fruits","Leafy greens","Avoid fatty and fried foods"]);

  if (has("shortness of breath","difficulty breathing","breathless") && has("chest","wheez"))
    return buildResult("Severe Asthma / Respiratory Distress", "High", 82,
      ["Use inhaler immediately","Sit upright","Seek emergency care","Avoid dust and smoke"],
      "Severe breathing difficulty requires immediate medical attention. Use prescribed inhaler and seek help.",
      ["Warm soups","Ginger honey tea","Avoid cold drinks","Steam inhalation","Turmeric milk"]);

  if (has("fever","temperature") && has("stiff neck","neck stiffness") && has("headache","vomiting"))
    return buildResult("Meningitis", "High", 80,
      ["Seek emergency care immediately","Do not delay treatment","Avoid bright lights","Hospitalization required"],
      "Fever with stiff neck and headache can indicate meningitis — a medical emergency. Go to hospital immediately.",
      ["IV fluids (hospital)","Soft foods","Avoid spicy food","Stay hydrated"]);

  if (has("blood","vomit") || has("coughing blood","blood in urine","blood in stool"))
    return buildResult("Internal Bleeding / Serious Condition", "High", 85,
      ["Seek emergency care immediately","Do not eat or drink","Lie down","Call ambulance"],
      "Presence of blood is a serious symptom. Seek emergency medical care immediately.",
      ["Nothing by mouth until evaluated","IV fluids as prescribed"]);

  // ── FEVER COMBOS ──
  if (has("fever","temperature","high fever") && has("cough") && has("sore throat","cold","runny nose","sneezing"))
    return buildResult("Common Cold / Flu", "Medium", 85,
      ["Rest at home for 3-5 days","Drink warm fluids every 2 hours","Take paracetamol for fever","Gargle with warm salt water","Avoid cold drinks and AC"],
      "Classic flu symptoms. Rest well and stay hydrated. See a doctor if fever exceeds 103°F or lasts more than 5 days.",
      ["Warm chicken/veg soup","Ginger lemon honey tea","Citrus fruits (Vitamin C)","Turmeric milk at night","Avoid dairy and cold foods"]);

  if (has("fever","temperature") && has("joint pain","body ache","muscle pain") && has("rash","red spots","skin rash"))
    return buildResult("Dengue Fever", "High", 86,
      ["Visit doctor immediately for blood test","Monitor platelet count daily","Take paracetamol only — NO aspirin","Drink 3-4 litres of fluids daily","Complete bed rest"],
      "Fever with joint pain and rash strongly suggests Dengue. Get a NS1 antigen test done immediately.",
      ["Papaya leaf juice (increases platelets)","Coconut water","Pomegranate juice","Kiwi fruit","Light khichdi and dal","Avoid spicy and oily food"]);

  if (has("fever","temperature") && has("chills","shivering") && has("sweating","sweat") && has("headache","vomiting","nausea"))
    return buildResult("Malaria", "High", 84,
      ["Visit doctor for blood smear test","Take prescribed antimalarials","Sleep under mosquito net","Stay hydrated","Avoid self-medication"],
      "Cyclic fever with chills and sweating is the classic pattern of malaria. Get a blood test done immediately.",
      ["ORS and coconut water","Soft rice with dal","Banana and papaya","Avoid heavy spicy meals","Plenty of warm fluids"]);

  if (has("fever","temperature") && has("yellow","jaundice","yellowish skin","dark urine"))
    return buildResult("Jaundice / Hepatitis", "High", 83,
      ["Visit doctor immediately for liver function test","Complete bed rest","Avoid alcohol completely","No fatty or oily foods","Stay hydrated"],
      "Fever with yellowing of skin/eyes indicates jaundice or hepatitis. Liver function tests are needed urgently.",
      ["Sugarcane juice","Coconut water","Boiled vegetables","Light khichdi","Papaya","Avoid oil, spices, and alcohol"]);

  if (has("fever","temperature") && has("diarrhea","loose motion") && has("vomiting","nausea") && has("stomach","abdomen","abdominal"))
    return buildResult("Typhoid Fever", "High", 81,
      ["Visit doctor for Widal test","Take prescribed antibiotics","Drink only boiled/bottled water","Complete bed rest","Maintain hygiene"],
      "Persistent fever with digestive symptoms may indicate typhoid. Get a Widal test done and consult a doctor.",
      ["Boiled water only","Soft rice and dal","Banana","Boiled vegetables","ORS drinks","Avoid raw food and outside food"]);

  if (has("fever","temperature") && has("cough") && has("rash","skin rash","red rash"))
    return buildResult("Viral Fever with Rash", "Medium", 79,
      ["Consult doctor for diagnosis","Take paracetamol for fever","Avoid scratching rash","Rest and hydrate","Monitor for 48 hours"],
      "Fever with rash and cough can be caused by viral infections. Consult a doctor for proper diagnosis.",
      ["Warm soups","Coconut water","Fruits rich in Vitamin C","Turmeric milk","Light easily digestible meals"]);

  if (has("fever","temperature") && has("sore throat","throat pain","tonsil"))
    return buildResult("Strep Throat / Tonsillitis", "Medium", 80,
      ["Visit doctor for throat swab","Take prescribed antibiotics if bacterial","Gargle with warm salt water 3x daily","Avoid cold drinks","Rest voice"],
      "Fever with sore throat may indicate strep throat or tonsillitis. A throat swab can confirm the diagnosis.",
      ["Warm soups","Honey and ginger tea","Warm water with turmeric","Soft foods","Ice cream to soothe (if no fever)","Avoid spicy food"]);

  if (has("fever") && has("burning urination","urination pain","frequent urination","uti"))
    return buildResult("Urinary Tract Infection (UTI)", "Medium", 82,
      ["Visit doctor for urine culture","Take prescribed antibiotics","Drink 2-3 litres of water daily","Avoid holding urine","Maintain hygiene"],
      "Fever with urinary symptoms indicates a UTI. Drink plenty of water and consult a doctor for antibiotics.",
      ["Cranberry juice","Plenty of water","Coconut water","Yogurt/curd","Avoid caffeine and alcohol"]);

  // ── RESPIRATORY ──
  if (has("cough") && has("wheez","chest tightness","breathless") && !has("fever"))
    return buildResult("Asthma / Bronchitis", "Medium", 78,
      ["Use prescribed inhaler","Avoid dust, smoke, and allergens","Stay warm","Do breathing exercises","Consult pulmonologist"],
      "Cough with wheezing suggests asthma or bronchitis. Use your inhaler and avoid respiratory triggers.",
      ["Warm soups","Ginger honey tea","Turmeric milk","Steam inhalation","Avoid cold drinks and dust"]);

  if (has("cough") && has("sore throat","runny nose","sneezing") && !has("fever"))
    return buildResult("Common Cold", "Low", 88,
      ["Rest at home","Drink warm fluids","Gargle with salt water","Take steam inhalation","Avoid cold exposure"],
      "Classic common cold. Should resolve in 5-7 days with rest and warm fluids.",
      ["Warm soups","Ginger lemon tea","Honey water","Citrus fruits","Turmeric milk","Avoid cold drinks"]);

  if (has("cough") && has("blood","hemoptysis") )
    return buildResult("Tuberculosis / Serious Lung Condition", "High", 83,
      ["Visit doctor immediately","Get chest X-ray and sputum test","Wear a mask","Isolate from others","Do not delay treatment"],
      "Coughing blood is a serious symptom that requires immediate medical evaluation. Could indicate TB or other lung conditions.",
      ["High protein diet","Eggs and lean meat","Green vegetables","Fruits","Avoid smoking completely"]);

  // ── DIGESTIVE ──
  if (has("vomiting","vomit") && has("diarrhea","loose motion") && has("stomach","abdominal","abdomen"))
    return buildResult("Gastroenteritis (Stomach Flu)", "Medium", 86,
      ["Drink ORS every 15-20 minutes","Avoid solid food for 4-6 hours","Wash hands frequently","Rest completely","See doctor if no improvement in 24hrs"],
      "Stomach flu caused by viral or bacterial infection. Focus on rehydration with ORS.",
      ["ORS solution","Coconut water","Plain rice (no spices)","Banana","Curd/yogurt","Avoid dairy, spicy and oily food"]);

  if (has("acidity","heartburn","burning","acid reflux") && has("bloating","indigestion","belching"))
    return buildResult("Acid Reflux / GERD", "Low", 84,
      ["Eat small frequent meals","Don't lie down for 2hrs after eating","Take antacid","Avoid trigger foods","Elevate head while sleeping"],
      "Classic GERD symptoms. Lifestyle changes and antacids will provide relief.",
      ["Banana","Cold milk","Coconut water","Boiled vegetables","Oatmeal","Avoid tea, coffee, spicy and oily food"]);

  if (has("stomach pain","abdominal pain","abdomen") && has("constipation","no bowel","hard stool"))
    return buildResult("Constipation / IBS", "Low", 80,
      ["Drink 8-10 glasses of water daily","Eat high fiber foods","Walk 30 minutes daily","Avoid processed foods","Take prescribed laxative if needed"],
      "Constipation with abdominal pain. Increase fiber and water intake. Should improve in 2-3 days.",
      ["Papaya","Prunes","Isabgol (psyllium husk) in warm water","High fiber vegetables","Warm water with lemon","Avoid maida and processed food"]);

  // ── HEAD & NEURO ──
  if (has("headache","migraine") && has("nausea","vomiting") && has("light sensitivity","sound sensitivity","aura"))
    return buildResult("Migraine", "Medium", 85,
      ["Rest in dark quiet room immediately","Take prescribed migraine medication","Apply cold compress on forehead","Avoid screens and bright lights","Track triggers"],
      "Classic migraine presentation. Rest in a dark quiet room. Take prescribed medication at onset for best effect.",
      ["Ginger tea","Magnesium-rich foods (nuts, seeds)","Stay well hydrated","Avoid caffeine, alcohol, and aged cheese","Regular meal timings"]);

  if (has("headache") && has("dizziness","vertigo","balance") && has("nausea"))
    return buildResult("Vertigo / Inner Ear Disorder", "Medium", 78,
      ["Sit or lie down immediately","Avoid sudden head movements","Consult ENT doctor","Do Epley maneuver if known","Avoid driving"],
      "Dizziness with headache and nausea may indicate vertigo or inner ear issues. Consult an ENT specialist.",
      ["Stay hydrated","Low salt diet","Ginger tea for nausea","Small frequent meals","Avoid caffeine and alcohol"]);

  if (has("headache") && has("stress","anxiety","tension") && !has("fever"))
    return buildResult("Tension Headache", "Low", 82,
      ["Rest in quiet dark room","Take paracetamol or ibuprofen","Apply warm compress to neck","Practice deep breathing","Reduce screen time"],
      "Tension headache likely from stress or screen fatigue. Rest and pain relief should help within a few hours.",
      ["Plenty of water","Magnesium-rich foods","Chamomile tea","Nuts and seeds","Avoid caffeine and alcohol"]);

  // ── SKIN ──
  if (has("rash","hives","urticaria") && has("itch","itching") && has("swelling","swollen"))
    return buildResult("Severe Allergic Reaction", "High", 83,
      ["Take antihistamine immediately","Identify and avoid allergen","Seek emergency care if throat swells","Apply calamine lotion","Do not scratch"],
      "Allergic reaction with swelling. If throat or face swells, seek emergency care immediately (anaphylaxis risk).",
      ["Anti-inflammatory foods","Turmeric","Ginger","Plenty of water","Avoid known allergens"]);

  if (has("rash","skin rash") && has("itch","itching") && !has("fever"))
    return buildResult("Allergic Dermatitis / Eczema", "Low", 80,
      ["Apply calamine lotion","Take antihistamine tablet","Avoid scratching","Use mild soap and moisturizer","Identify and avoid trigger"],
      "Skin rash with itching suggests allergic reaction or eczema. Antihistamines and topical creams will help.",
      ["Anti-inflammatory diet","Turmeric milk","Omega-3 foods","Plenty of water","Avoid processed and spicy foods"]);

  // ── MUSCULOSKELETAL ──
  if (has("back pain","lower back") && has("leg pain","leg numb","sciatica","radiating"))
    return buildResult("Sciatica / Disc Problem", "Medium", 79,
      ["Rest on firm mattress","Apply hot/cold compress","Do prescribed physiotherapy","Avoid bending and lifting","Consult orthopedic"],
      "Back pain radiating to leg suggests sciatica or disc issue. Physiotherapy and rest are key treatments.",
      ["Anti-inflammatory foods","Turmeric milk","Calcium and Vitamin D foods","Fish and nuts","Avoid heavy lifting"]);

  if (has("back pain","lower back") && !has("fever","leg"))
    return buildResult("Muscle Strain / Back Pain", "Low", 83,
      ["Rest for 1-2 days","Apply warm compress for 20 mins 3x daily","Take ibuprofen if needed","Do gentle stretching","Avoid heavy lifting"],
      "Likely muscle strain from posture or overexertion. Rest and warm compress should provide relief in 2-3 days.",
      ["Anti-inflammatory foods","Turmeric milk","Calcium-rich foods (milk, curd)","Omega-3 foods","Avoid heavy lifting"]);

  if (has("joint pain","joints") && has("swelling","swollen") && has("morning stiffness","stiffness"))
    return buildResult("Rheumatoid Arthritis", "Medium", 78,
      ["Consult rheumatologist","Take prescribed anti-inflammatory medication","Do gentle range-of-motion exercises","Apply warm compress","Avoid cold exposure"],
      "Joint pain with morning stiffness and swelling suggests rheumatoid arthritis. Early treatment prevents joint damage.",
      ["Omega-3 rich foods (fish, flaxseed)","Turmeric and ginger","Vitamin D foods","Anti-inflammatory vegetables","Avoid processed and fried foods"]);

  if (has("joint pain","knee pain","hip pain") && !has("fever","swelling"))
    return buildResult("Osteoarthritis / Joint Pain", "Low", 80,
      ["Rest the affected joint","Apply ice pack for 15 mins","Take prescribed pain relief","Do low-impact exercise","Consult orthopedic if persists"],
      "Joint pain likely due to osteoarthritis or overuse. Rest, pain relief, and gentle exercises will help.",
      ["Calcium-rich foods","Vitamin D foods","Turmeric milk","Omega-3 foods","Maintain healthy weight"]);

  // ── MENTAL HEALTH ──
  if (has("anxiety","panic","panic attack") && has("heart racing","chest tight","breathless","dizziness"))
    return buildResult("Anxiety / Panic Attack", "Medium", 81,
      ["Practice deep slow breathing (4-7-8 technique)","Ground yourself — name 5 things you can see","Sit down in a calm place","Consult a doctor or therapist","Avoid caffeine"],
      "Symptoms suggest anxiety or panic attack. Deep breathing and grounding techniques help immediately. Consider therapy.",
      ["Magnesium-rich foods","Chamomile tea","Bananas","Dark chocolate (small amount)","Avoid caffeine and alcohol"]);

  if (has("fatigue","tired","exhausted") && has("sad","depressed","hopeless","no interest","motivation"))
    return buildResult("Depression / Burnout", "Medium", 76,
      ["Consult a doctor or mental health professional","Maintain regular sleep schedule","Exercise 30 minutes daily","Stay connected with loved ones","Avoid isolation"],
      "Fatigue with low mood suggests depression or burnout. Please speak to a doctor or therapist — it is treatable.",
      ["Omega-3 foods","Vitamin D foods","Dark leafy greens","Nuts and seeds","Avoid alcohol and processed foods"]);

  // ── DIABETES / METABOLIC ──
  if (has("frequent urination","thirst","excessive thirst") && has("fatigue","tired","weakness") && has("blurred vision","vision","hunger"))
    return buildResult("Diabetes (Type 2)", "High", 82,
      ["Visit doctor for fasting blood sugar test","Monitor blood glucose levels","Avoid sugary foods immediately","Exercise 30 mins daily","Follow diabetic diet"],
      "Classic diabetes symptoms. Get a fasting blood sugar test done immediately. Early diagnosis prevents complications.",
      ["High fiber vegetables","Brown rice instead of white","Bitter gourd (karela)","Fenugreek seeds","Avoid sugar, sweets, and refined carbs"]);

  // ── DEFAULT — use ML result if no pattern matched ──
  return {
    disease:     mlData.disease     || "Unspecified Condition",
    risk_level:  mlData.risk_level  || "Medium",
    confidence:  mlData.confidence  || 65,
    advice:      mlData.advice      || "Please consult a doctor for a proper diagnosis.",
    precautions: mlData.precautions || ["Rest well","Stay hydrated","Consult a doctor","Monitor symptoms"],
    diet:        mlData.diet        || ["Balanced meals","Plenty of water","Fresh fruits","Green vegetables"],
  };
};

const buildResult = (disease, risk, confidence, precautions, advice, diet) => ({
  disease, risk_level: risk, confidence, precautions, advice, diet,
});

// Fallback prediction logic
const getFallbackPrediction = (symptoms) => {
  const s = symptoms.map((s) => s.toLowerCase().trim());

  // High risk conditions
  if (s.some(x => ["chest pain","palpitations","heart racing","left arm pain"].includes(x)))
    return { disease: "Possible Cardiac Issue", risk_level: "High",
      confidence: 72, precautions: ["Seek emergency care immediately","Avoid physical exertion","Chew aspirin if available","Call ambulance"],
      advice: "These symptoms may indicate a cardiac issue. Seek immediate medical attention.",
      diet: ["Low sodium foods","Omega-3 rich foods","Fresh fruits","Avoid fatty foods"] };

  if (s.some(x => ["shortness of breath","difficulty breathing","breathlessness"].includes(x)))
    return { disease: "Respiratory Distress", risk_level: "High",
      confidence: 70, precautions: ["Seek medical help immediately","Sit upright","Avoid exertion","Use inhaler if prescribed"],
      advice: "Breathing difficulty requires immediate medical attention.",
      diet: ["Light meals","Warm liquids","Honey and ginger tea","Avoid cold foods"] };

  // Fever based
  if (s.some(x => ["fever","high fever","temperature"].includes(x)) && s.some(x => ["cough","sore throat","runny nose","cold"].includes(x)))
    return { disease: "Common Cold / Flu", risk_level: "Medium",
      confidence: 78, precautions: ["Rest at home","Stay hydrated","Take paracetamol","Avoid cold exposure"],
      advice: "Likely viral infection. Rest well and stay hydrated. See doctor if fever exceeds 103°F.",
      diet: ["Warm soups","Ginger tea","Citrus fruits","Honey water","Turmeric milk"] };

  if (s.some(x => ["fever","high fever"].includes(x)) && s.some(x => ["joint pain","body ache","muscle pain","rash"].includes(x)))
    return { disease: "Dengue / Viral Fever", risk_level: "High",
      confidence: 74, precautions: ["Visit doctor immediately","Stay hydrated","Take paracetamol only","Avoid aspirin","Monitor platelet count"],
      advice: "These symptoms suggest possible dengue or viral fever. Consult a doctor immediately.",
      diet: ["Papaya leaf juice","Coconut water","Pomegranate juice","Light khichdi","Plenty of fluids"] };

  if (s.some(x => ["fever","chills"].includes(x)) && s.some(x => ["sweating","headache","vomiting"].includes(x)))
    return { disease: "Malaria / Typhoid", risk_level: "High",
      confidence: 71, precautions: ["Visit doctor for blood test","Take prescribed medicines","Stay hydrated","Use mosquito net"],
      advice: "Cyclic fever with chills may indicate malaria or typhoid. Get a blood test done.",
      diet: ["ORS fluids","Soft rice and dal","Bananas","Avoid spicy food","Coconut water"] };

  // Digestive
  if (s.some(x => ["vomiting","nausea","diarrhea","loose motion","stomach pain"].includes(x)))
    return { disease: "Gastroenteritis", risk_level: "Medium",
      confidence: 80, precautions: ["Drink ORS frequently","Avoid solid food initially","Rest","Wash hands regularly"],
      advice: "Likely stomach infection. Stay hydrated with ORS and avoid solid food for a few hours.",
      diet: ["ORS","Coconut water","Banana","Plain rice","Curd"] };

  if (s.some(x => ["acidity","heartburn","bloating","indigestion"].includes(x)))
    return { disease: "Acid Reflux / Indigestion", risk_level: "Low",
      confidence: 82, precautions: ["Avoid spicy food","Eat small meals","Don't lie down after eating","Take antacid"],
      advice: "Likely acid reflux. Eat smaller meals and avoid spicy or oily food.",
      diet: ["Banana","Cold milk","Coconut water","Boiled vegetables","Avoid tea and coffee"] };

  // Head & Neuro
  if (s.some(x => ["headache","migraine"].includes(x)) && s.some(x => ["nausea","light sensitivity","vomiting"].includes(x)))
    return { disease: "Migraine", risk_level: "Medium",
      confidence: 76, precautions: ["Rest in dark quiet room","Take prescribed pain relief","Avoid screen time","Apply cold compress"],
      advice: "Symptoms suggest migraine. Rest in a dark room and avoid triggers like bright light and noise.",
      diet: ["Ginger tea","Magnesium-rich foods","Stay hydrated","Avoid caffeine and alcohol"] };

  if (s.some(x => ["headache","dizziness","fatigue"].includes(x)))
    return { disease: "Tension Headache / Stress", risk_level: "Low",
      confidence: 75, precautions: ["Rest well","Stay hydrated","Reduce screen time","Practice deep breathing"],
      advice: "Likely tension headache from stress or dehydration. Rest and hydrate well.",
      diet: ["Plenty of water","Banana","Nuts","Green tea","Avoid alcohol"] };

  // Respiratory
  if (s.some(x => ["cough","sore throat","runny nose"].includes(x)))
    return { disease: "Common Cold", risk_level: "Low",
      confidence: 83, precautions: ["Rest at home","Drink warm fluids","Gargle with salt water","Avoid cold drinks"],
      advice: "Common cold symptoms. Rest and take warm fluids. Should resolve in 5-7 days.",
      diet: ["Warm soups","Ginger honey tea","Citrus fruits","Turmeric milk","Steam inhalation"] };

  if (s.some(x => ["cough","wheezing","chest tightness"].includes(x)))
    return { disease: "Asthma / Bronchitis", risk_level: "Medium",
      confidence: 73, precautions: ["Use prescribed inhaler","Avoid dust and smoke","Stay warm","Consult doctor"],
      advice: "Possible bronchitis or asthma. Avoid cold air and dust. Use prescribed inhaler if available.",
      diet: ["Warm soups","Ginger tea","Honey","Avoid cold drinks","Steam inhalation"] };

  // Skin
  if (s.some(x => ["rash","itching","skin rash","hives"].includes(x)))
    return { disease: "Allergic Reaction / Dermatitis", risk_level: "Medium",
      confidence: 74, precautions: ["Avoid allergen","Take antihistamine","Don't scratch","Apply calamine lotion"],
      advice: "Possible allergic reaction or skin condition. Avoid the allergen and take antihistamine.",
      diet: ["Anti-inflammatory foods","Turmeric milk","Avoid processed food","Plenty of water"] };

  // Pain
  if (s.some(x => ["back pain","lower back pain"].includes(x)))
    return { disease: "Muscle Strain / Back Pain", risk_level: "Low",
      confidence: 77, precautions: ["Rest","Apply hot/cold compress","Avoid heavy lifting","Gentle stretching"],
      advice: "Likely muscle strain. Rest and apply a warm compress. Avoid heavy lifting.",
      diet: ["Anti-inflammatory foods","Turmeric milk","Calcium rich foods","Omega-3 foods"] };

  if (s.some(x => ["joint pain","knee pain","swollen joints"].includes(x)))
    return { disease: "Arthritis / Joint Inflammation", risk_level: "Medium",
      confidence: 72, precautions: ["Rest the joint","Apply ice pack","Take anti-inflammatory","Consult orthopedic"],
      advice: "Joint pain may indicate arthritis or inflammation. Rest and apply ice. Consult a doctor.",
      diet: ["Omega-3 rich foods","Turmeric","Ginger","Cherries","Avoid processed foods"] };

  // Default
  return {
    disease: "General Discomfort", risk_level: "Low",
    confidence: 60, precautions: ["Rest well","Stay hydrated","Monitor symptoms","Consult doctor if worsens"],
    advice: "Monitor your symptoms. If they persist for more than 3 days, consult a doctor.",
    diet: ["Balanced meals","Plenty of water","Fresh fruits","Green vegetables"],
  };
};

const getRiskTags = (risk) => {
  if (risk === "High")   return [{ label: "High Risk", type: "red" }, { label: "See Doctor", type: "red" }];
  if (risk === "Medium") return [{ label: "Moderate", type: "blue" }, { label: "Monitor", type: "blue" }];
  return [{ label: "Low Risk", type: "green" }, { label: "Good", type: "green" }];
};

module.exports = { predictSymptoms, getSymptomHistory };