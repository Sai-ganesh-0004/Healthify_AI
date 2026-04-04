const calculateHealthScore = (userProfile, bmiData) => {
  let score = 10;
  const improvements = [];
  const strengths = [];

  if (Number(bmiData.bmi) > 25) {
    score -= 3;
    improvements.push("Reduce body weight through diet and exercise");
  } else {
    strengths.push("Healthy BMI range");
  }

  if (userProfile.goal === "lose weight") {
    improvements.push("Follow calorie deficit diet");
  }

  if (userProfile.goal === "gain weight" && Number(bmiData.bmi) < 18.5) {
    improvements.push("Follow calorie surplus diet with nutrient-rich foods");
  }

  if (Number(userProfile.weight) > 80) {
    score -= 2;
    improvements.push("Increase daily physical activity");
  }

  if (Number(userProfile.sleep) >= 7) strengths.push("Healthy sleep duration");
  if (Number(userProfile.exercise) >= 3)
    strengths.push("Consistent weekly exercise");
  if (Number(userProfile.smoker) === 0) strengths.push("Non-smoking lifestyle");

  if (score < 0) score = 0;

  return {
    score,
    strengths,
    improvements,
  };
};

module.exports = { calculateHealthScore };
