const analyzeSymptoms = (message = "") => {
  const msg = String(message).toLowerCase();
  const symptoms = [];
  const advice = [];

  if (msg.includes("chest pain")) {
    symptoms.push("Possible cardiovascular issue");
    advice.push("Consult a doctor immediately if pain is severe");
  }

  if (msg.includes("headache")) {
    symptoms.push("Possible dehydration or stress");
    advice.push("Drink water and rest");
  }

  if (msg.includes("tired") || msg.includes("fatigue")) {
    symptoms.push("Possible lack of sleep or iron deficiency");
    advice.push("Increase sleep and balanced diet");
  }

  if (msg.includes("dizzy")) {
    symptoms.push("Possible low blood pressure");
    advice.push("Sit down and drink fluids");
  }

  return { symptoms, advice };
};

module.exports = { analyzeSymptoms };
