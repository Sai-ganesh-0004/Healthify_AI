const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recommendations: [
      {
        meal_type:   { type: String },
        name:        { type: String },
        calories:    { type: Number },
        protein:     { type: String },
        carbs:       { type: String },
        fat:         { type: String },
        description: { type: String },
        tags:        { type: [String] },
      },
    ],
    generated_for: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);