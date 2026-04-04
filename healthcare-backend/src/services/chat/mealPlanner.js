const { getRandomFoods } = require("./foodService");
const { calculateDailyCalories } = require("./calorieService");

const generateMealPlan = (userProfile) => {
  const calories = calculateDailyCalories(
    userProfile.weight,
    userProfile.height,
    userProfile.goal,
  );

  return {
    calories,
    breakfast: getRandomFoods(2),
    lunch: getRandomFoods(2),
    dinner: getRandomFoods(2),
  };
};

module.exports = { generateMealPlan };
