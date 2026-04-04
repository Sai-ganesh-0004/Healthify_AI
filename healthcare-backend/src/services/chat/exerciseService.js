const path = require("path");
const { loadCSV } = require("./dataLoader");

const EXERCISES_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "data",
  "genai",
  "exercises.csv",
);

let exercises = [];
let exercisesPromise = null;

const loadExercises = async () => {
  if (exercises.length) return exercises;
  if (!exercisesPromise) {
    exercisesPromise = loadCSV(EXERCISES_PATH).then((rows) => {
      exercises = rows;
      return exercises;
    });
  }
  return exercisesPromise;
};

const getWorkoutPlan = (goal) => {
  if (!exercises.length) return [];

  if (goal === "lose weight") return exercises.slice(0, 6);
  if (goal === "gain weight") return exercises.slice(6, 12);
  if (goal === "gain muscle") return exercises.slice(6, 12);

  return exercises.slice(0, 4);
};

module.exports = { loadExercises, getWorkoutPlan };
