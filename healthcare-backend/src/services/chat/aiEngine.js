const { calculateBMI } = require("./bmiService");
const { generateMealPlan } = require("./mealPlanner");
const { generateWorkout } = require("./workoutPlanner");
const { analyzeHealthRisk } = require("./riskAnalyzer");
const { analyzeSymptoms } = require("./symptomAnalyzer");
const { calculateHealthScore } = require("./healthScore");
const { predictWeightTrend } = require("./weightPredictor");
const { preloadChatServices } = require("./bootstrap");

const buildHealthContext = async (userProfile, message) => {
  await preloadChatServices();

  const bmiData = calculateBMI(userProfile.height, userProfile.weight);
  const mealPlan = generateMealPlan(userProfile);
  const workout = generateWorkout(userProfile);
  const risk = analyzeHealthRisk(bmiData.bmi);
  const symptom = analyzeSymptoms(message);
  const healthScore = calculateHealthScore(userProfile, bmiData);
  const weightTrend = predictWeightTrend(userProfile.weight, userProfile.goal);

  return {
    bmiData,
    mealPlan,
    workout,
    risk,
    symptom,
    healthScore,
    weightTrend,
  };
};

module.exports = { buildHealthContext };
