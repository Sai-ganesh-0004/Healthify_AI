const calculateDailyCalories = (weight, height, goal) => {
  let calories = (Number(weight) || 70) * 30;

  if (goal === "lose weight") calories -= 400;
  if (goal === "gain weight") calories += 500;
  if (goal === "gain muscle") calories += 400;

  return calories;
};

module.exports = { calculateDailyCalories };
