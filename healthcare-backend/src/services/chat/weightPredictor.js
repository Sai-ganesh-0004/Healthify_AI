const predictWeightTrend = (currentWeight, goal) => {
  const baseWeight = Number(currentWeight) || 70;
  let weeklyChange = 0;

  if (goal === "lose weight") weeklyChange = -0.5;
  if (goal === "gain weight") weeklyChange = 0.4;
  if (goal === "gain muscle") weeklyChange = 0.3;
  if (goal === "maintain") weeklyChange = 0;

  const trend = [];
  for (let index = 0; index <= 12; index += 1) {
    trend.push({
      week: `Week ${index}`,
      weight: Number((baseWeight + weeklyChange * index).toFixed(1)),
    });
  }

  return trend;
};

module.exports = { predictWeightTrend };
