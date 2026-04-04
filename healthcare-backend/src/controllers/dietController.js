const DietPlan = require("../models/DietPlan");

const DEFAULT_DIET = [
  { meal_type: "Breakfast", name: "Oats & Berry Bowl", calories: 320, protein: "12g", carbs: "52g", fat: "8g", tags: ["High Fiber", "Low Sugar", "Antioxidant"] },
  { meal_type: "Mid Morning", name: "Fruit & Nut Mix", calories: 180, protein: "5g", carbs: "22g", fat: "9g", tags: ["Energy Boost", "Healthy Fats"] },
  { meal_type: "Lunch", name: "Grilled Chicken Salad", calories: 480, protein: "38g", carbs: "20g", fat: "14g", tags: ["High Protein", "Low Carb", "Iron Rich"] },
  { meal_type: "Evening Snack", name: "Green Smoothie", calories: 150, protein: "6g", carbs: "28g", fat: "2g", tags: ["Detox", "Vitamin C", "Hydrating"] },
  { meal_type: "Dinner", name: "Dal Rice & Sabzi", calories: 520, protein: "22g", carbs: "78g", fat: "10g", tags: ["Balanced", "Fiber Rich", "Gut Health"] },
  { meal_type: "Before Bed", name: "Warm Turmeric Milk", calories: 110, protein: "5g", carbs: "12g", fat: "4g", tags: ["Anti-inflammatory", "Sleep Aid"] },
];

// @GET /api/diet
const getDietRecommendations = async (req, res) => {
  try {
    // Check if user has a saved diet plan
    let dietPlan = await DietPlan.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!dietPlan) {
      // Create a default diet plan for the user
      dietPlan = await DietPlan.create({
        user: req.user._id,
        recommendations: DEFAULT_DIET,
        generated_for: "general",
      });
    }

    res.json({ recommendations: dietPlan.recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/diet/custom
const createCustomDiet = async (req, res) => {
  try {
    const { recommendations, generated_for } = req.body;

    const dietPlan = await DietPlan.create({
      user: req.user._id,
      recommendations,
      generated_for,
    });

    res.status(201).json({ message: "Diet plan created", dietPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDietRecommendations, createCustomDiet };