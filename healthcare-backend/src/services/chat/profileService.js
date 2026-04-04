const GOAL_MAP = {
  weightloss: "lose weight",
  musclegain: "gain muscle",
  balanced: "maintain",
  "lose weight": "lose weight",
  "gain weight": "gain weight",
  "gain muscle": "gain muscle",
  maintain: "maintain",
};

const DIET_MAP = {
  veg: "veg",
  vegetarian: "veg",
  nonveg: "nonveg",
  "non-veg": "nonveg",
  both: "both",
  balanced: "both",
};

const normalizeGender = (gender) => {
  if (gender === 0 || gender === 1) return Number(gender);

  const value = String(gender || "")
    .trim()
    .toLowerCase();
  if (value === "female") return 0;
  return 1;
};

const normalizeGoal = (goal) =>
  GOAL_MAP[
    String(goal || "")
      .trim()
      .toLowerCase()
  ] || "maintain";
const normalizeDiet = (diet) =>
  DIET_MAP[
    String(diet || "")
      .trim()
      .toLowerCase()
  ] || "both";

const toNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
};

const normalizeChatProfile = (user = {}, providedProfile = {}) => {
  const raw = { ...user, ...providedProfile };

  return {
    age: toNumber(raw.age, 25),
    gender: normalizeGender(raw.gender),
    height: toNumber(raw.height, 170),
    weight: toNumber(raw.weight, 70),
    sleep: toNumber(raw.sleep, 7),
    exercise: toNumber(raw.exercise, 3),
    smoker: Number(raw.smoker) === 1 ? 1 : 0,
    alcohol: Math.max(0, Number(raw.alcohol) || 0),
    diabetic: Number(raw.diabetic) === 1 ? 1 : 0,
    heart_disease: Number(raw.heart_disease) === 1 ? 1 : 0,
    goal: normalizeGoal(raw.goal),
    diet: normalizeDiet(raw.diet),
  };
};

module.exports = { normalizeChatProfile };
