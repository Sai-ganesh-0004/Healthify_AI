const { getWorkoutPlan } = require("./exerciseService");

const generateWorkout = (userProfile) => {
  const exercises = getWorkoutPlan(userProfile.goal);

  return {
    warmup: exercises.slice(0, 2),
    workout: exercises.slice(2, 5),
    cooldown: exercises.slice(5, 6),
  };
};

module.exports = { generateWorkout };
