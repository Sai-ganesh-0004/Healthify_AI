const axios = require("axios");

// ML Service URL - can be configured via environment variable
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5000";

const getMLPredictions = async (data) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict/health`,
      data,
      {
        timeout: 10000, // 10 second timeout
      },
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error ||
      error.message ||
      "ML Service prediction failed";
    throw new Error(errorMsg);
  }
};

const generateProjections = (userProfile, predictions = {}) => {
  const currentWeight = Number(userProfile.weight) || 70;
  const goal = userProfile.goal;
  const predictedWeight = Number(predictions?.predicted_weight);
  const obesityRisk = String(predictions?.obesity_risk || "");
  const heightMeters = (Number(userProfile.height) || 170) / 100;

  const fallbackTarget =
    {
      "lose weight": currentWeight - 4,
      "gain weight": currentWeight + 3,
      "gain muscle": currentWeight + 2.5,
    }[goal] ?? currentWeight;

  let withPlanTarget = Number.isFinite(predictedWeight)
    ? predictedWeight
    : fallbackTarget;

  let withoutPlanTarget = currentWeight;

  if (goal === "lose weight") {
    withPlanTarget = Math.min(withPlanTarget, currentWeight - 0.5);
    withoutPlanTarget =
      currentWeight +
      (obesityRisk === "Obese" || obesityRisk === "Overweight" ? 2.6 : 1.2);
  } else if (goal === "gain weight") {
    withPlanTarget = Math.max(withPlanTarget, currentWeight + 0.5);
    withoutPlanTarget = currentWeight - 0.8;
  } else if (goal === "gain muscle") {
    withPlanTarget = Math.max(withPlanTarget, currentWeight + 0.4);
    withoutPlanTarget = currentWeight - 0.6;
  } else {
    withoutPlanTarget =
      currentWeight +
      (obesityRisk === "Obese" || obesityRisk === "Overweight" ? 1.5 : 0.5);
  }

  const weightData = [];
  const obesityData = [];

  for (let index = 0; index <= 12; index += 1) {
    const progress = index / 12;
    const withPlanProgress = Math.pow(progress, 0.9);
    const withoutPlanProgress = Math.pow(progress, 1.15);

    const withPlanWeight =
      currentWeight + (withPlanTarget - currentWeight) * withPlanProgress;
    const withoutPlanWeight =
      currentWeight + (withoutPlanTarget - currentWeight) * withoutPlanProgress;

    weightData.push({
      week: `W${index}`,
      withPlan: Number(withPlanWeight.toFixed(1)),
      withoutPlan: Number(withoutPlanWeight.toFixed(1)),
    });

    obesityData.push({
      week: `W${index}`,
      withPlan: Number(
        (withPlanWeight / (heightMeters * heightMeters)).toFixed(1),
      ),
      withoutPlan: Number(
        (withoutPlanWeight / (heightMeters * heightMeters)).toFixed(1),
      ),
    });
  }

  return { weightData, obesityData };
};

module.exports = { getMLPredictions, generateProjections };
