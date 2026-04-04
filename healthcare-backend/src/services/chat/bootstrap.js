const { loadFoods } = require("./foodService");
const { loadExercises } = require("./exerciseService");

let preloadPromise = null;

const preloadChatServices = async () => {
  if (!preloadPromise) {
    preloadPromise = Promise.all([loadFoods(), loadExercises()]);
  }

  return preloadPromise;
};

module.exports = { preloadChatServices };
