const mongoose = require("mongoose");

const waterIntakeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // Format: "YYYY-MM-DD"
    data: { type: [Number], required: true }, // [calories, glasses]
  },
  { timestamps: true },
);

module.exports = mongoose.model("WaterIntake", waterIntakeSchema);
