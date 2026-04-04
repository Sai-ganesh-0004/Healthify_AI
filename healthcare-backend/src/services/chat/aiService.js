const { GoogleGenAI } = require("@google/genai");
const { buildHealthContext } = require("./aiEngine");

const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const dietLabel = (diet) => {
  if (diet === "veg") return "Vegetarian only";
  if (diet === "nonveg") return "Non-Vegetarian";
  return "Both Veg & Non-Veg";
};

const serializeFoods = (foods) => {
  return foods
    .map(
      (food) =>
        food.Description || food.name || food.Category || JSON.stringify(food),
    )
    .join(", ");
};

const formatHistory = (history = []) => {
  return history
    .slice(-6)
    .map(
      (item) =>
        `${item.role === "assistant" ? "Assistant" : "User"}: ${item.content}`,
    )
    .join("\n");
};

const generateResponse = async ({
  message,
  userProfile,
  isFirstMessage,
  history = [],
}) => {
  const ai = getAiClient();
  const context = await buildHealthContext(userProfile, message);

  let prompt = "";

  if (isFirstMessage) {
    prompt = `
You are HealthAI Companion, a friendly, concise healthcare and fitness assistant inside a healthcare application. Keep responses clean, practical, and easy to read.

User: ${userProfile.age} years old, ${userProfile.height}cm, ${userProfile.weight}kg
Goal: ${userProfile.goal} | BMI: ${context.bmiData.bmi} (${context.bmiData.category})
Diet: ${dietLabel(userProfile.diet)}

Context data (use selectively, do not dump everything):
- Calories: ${context.mealPlan.calories}/day
- Breakfast options: ${serializeFoods(context.mealPlan.breakfast)}
- Lunch options: ${serializeFoods(context.mealPlan.lunch)}
- Dinner options: ${serializeFoods(context.mealPlan.dinner)}
- Workout: ${JSON.stringify(context.workout.workout)}
- Risks: ${JSON.stringify(context.risk.risks)}
- Symptom hints: ${JSON.stringify(context.symptom.symptoms)}
- Health Score: ${context.healthScore.score}/10

User Question: ${message}

RULES:
- Use Markdown with these sections when relevant: ## Health Summary, ## Meal Plan, ## Workout, ## Tips
- Keep it concise: 3-5 bullet points per section maximum
- In Meal Plan, list specific Breakfast, Lunch, and Dinner options with simple portions when relevant
- Use bold for key numbers
- No walls of text
- Mention that serious symptoms still require a real doctor
- IMPORTANT: This app is for Indian users. For non-veg items, only suggest eggs, chicken, and fish.
- If diet is Vegetarian only, do not include meat, eggs, or fish.
`;
  } else {
    prompt = `
You are HealthAI Companion, a concise healthcare assistant.

User: ${userProfile.age}y, ${userProfile.height}cm, ${userProfile.weight}kg, Goal: ${userProfile.goal}
Diet: ${dietLabel(userProfile.diet)}
Recent conversation:
${formatHistory(history) || "No previous context."}

Question: ${message}

RULES:
- Answer only the question asked
- Keep it under 180 words
- Use Markdown formatting with short bullets when helpful
- Be direct and actionable
- Mention when a doctor should be consulted for serious symptoms
- For Indian users, non-veg items are limited to eggs, chicken, and fish only
- If diet is Vegetarian only, do not include meat, eggs, or fish
`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return {
    text: response.text,
    context,
  };
};

module.exports = { generateResponse };
