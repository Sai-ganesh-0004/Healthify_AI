const analyzeHealthRisk = (bmi) => {
  const numericBmi = Number(bmi) || 0;
  const risks = [];
  const advice = [];

  if (numericBmi < 18.5) {
    risks.push("Nutritional deficiency");
    advice.push("Increase calorie intake");
    advice.push("Add protein rich foods");
  } else if (numericBmi >= 25 && numericBmi < 30) {
    risks.push("Heart disease");
    risks.push("High blood pressure");
    advice.push("Reduce sugar intake");
    advice.push("Exercise daily for 30 minutes");
  } else if (numericBmi >= 30) {
    risks.push("Type 2 diabetes");
    risks.push("Cardiovascular disease");
    advice.push("Consult a healthcare professional");
    advice.push("Adopt strict calorie control");
  }

  return { risks, advice };
};

module.exports = { analyzeHealthRisk };
