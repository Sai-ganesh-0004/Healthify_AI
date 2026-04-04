const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symptoms:   { type: [String], required: true },
    age:        { type: Number },
    duration:   { type: String },
    prediction: {
      disease:    { type: String },
      risk_level: { type: String, enum: ["Low", "Medium", "High"] },
      advice:     { type: String },
      diet:       { type: [String] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Symptom", symptomSchema);