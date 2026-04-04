const { spawn } = require("child_process");
const path = require("path");

const ML_DIR = path.join(__dirname, "..", "..", "..", "genai-ml");
const PREDICT_SCRIPT = path.join(ML_DIR, "predict.py");

const getPythonCommand = () => process.env.GENAI_ML_PYTHON || "python";

const getMLPredictions = (data) => {
  return new Promise((resolve, reject) => {
    const python = spawn(
      getPythonCommand(),
      [PREDICT_SCRIPT, JSON.stringify(data)],
      {
        cwd: ML_DIR,
      },
    );

    let result = "";
    let error = "";

    python.stdout.on("data", (chunk) => {
      result += chunk.toString();
    });

    python.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(error || "Graph ML prediction failed"));
        return;
      }

      try {
        resolve(JSON.parse(result.trim()));
      } catch (parseError) {
        reject(new Error("Failed to parse graph ML output"));
      }
    });
  });
};

const generateProjections = (userProfile) => {
  const currentWeight = Number(userProfile.weight) || 70;
  const goal = userProfile.goal;
  const heightMeters = (Number(userProfile.height) || 170) / 100;

  let planChange = 0;
  let noPlanChange = 0;

  if (goal === "lose weight") {
    planChange = -0.5;
    noPlanChange = 0.15;
  } else if (goal === "gain weight") {
    planChange = 0.4;
    noPlanChange = -0.1;
  } else if (goal === "gain muscle") {
    planChange = 0.35;
    noPlanChange = -0.1;
  } else {
    planChange = 0;
    noPlanChange = 0.2;
  }

  const weightData = [];
  const obesityData = [];

  for (let index = 0; index <= 12; index += 1) {
    const withPlanWeight = currentWeight + planChange * index;
    const withoutPlanWeight = currentWeight + noPlanChange * index;

    weightData.push({
      week: `W${index}`,
      withPlan: Number(withPlanWeight.toFixed(1)),
      withoutPlan: Number(withoutPlanWeight.toFixed(1)),
    });

    obesityData.push({
      week: `W${index}`,
      withPlan: Number(
        (withPlanWeight / (heightMeters * heightMeters)).toFixed(1),
      ),
      withoutPlan: Number(
        (withoutPlanWeight / (heightMeters * heightMeters)).toFixed(1),
      ),
    });
  }

  return { weightData, obesityData };
};

module.exports = { getMLPredictions, generateProjections };
