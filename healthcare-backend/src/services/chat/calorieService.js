const getActivityFactor = (exerciseDaysPerWeek) => {
  const days = Number(exerciseDaysPerWeek) || 0;
  if (days <= 1) return 1.2;
  if (days <= 3) return 1.375;
  if (days <= 5) return 1.55;
  return 1.725;
};

const calculateDailyCalories = ({
  weight,
  height,
  age,
  gender,
  exercise,
  goal,
}) => {
  const weightKg = Number(weight) || 70;
  const heightCm = Number(height) || 170;
  const ageYears = Number(age) || 25;
  const isFemale = Number(gender) === 0;

  // Mifflin-St Jeor BMR
  const bmr = isFemale
    ? 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;

  let calories = bmr * getActivityFactor(exercise);

  if (goal === "lose weight") calories -= 500;
  if (goal === "gain weight") calories += 300;
  if (goal === "gain muscle") calories += 200;

  // Keep recommendations in a safer practical range.
  const minCalories = isFemale ? 1200 : 1500;
  calories = Math.max(minCalories, calories);

  return Math.round(calories / 10) * 10;
};

module.exports = { calculateDailyCalories };
