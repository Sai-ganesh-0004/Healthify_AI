const path = require("path");
const { loadCSV } = require("./dataLoader");

const FOODS_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "data",
  "genai",
  "foods.csv",
);

let foods = [];
let foodsPromise = null;

const loadFoods = async () => {
  if (foods.length) return foods;
  if (!foodsPromise) {
    foodsPromise = loadCSV(FOODS_PATH).then((rows) => {
      foods = rows;
      return foods;
    });
  }
  return foodsPromise;
};

const getRandomFoods = (count = 5) => {
  if (!foods.length) return [];

  const shuffled = [...foods].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

module.exports = { loadFoods, getRandomFoods };
