const calculateBMI = (height, weight) => {
  const safeHeight = Number(height) || 170;
  const safeWeight = Number(weight) || 70;
  const heightMeters = safeHeight / 100;
  const bmi = safeWeight / (heightMeters * heightMeters);

  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return {
    bmi: Number(bmi.toFixed(2)),
    category,
  };
};

module.exports = { calculateBMI };
