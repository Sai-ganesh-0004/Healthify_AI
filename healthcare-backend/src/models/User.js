const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    weight: { type: Number },
    height: { type: Number },
    sleep: { type: Number },
    exercise: { type: Number },
    smoker: { type: Number, enum: [0, 1], default: 0 },
    alcohol: { type: Number, default: 0 },
    diabetic: { type: Number, enum: [0, 1], default: 0 },
    heart_disease: { type: Number, enum: [0, 1], default: 0 },
    goal: { type: String },
    diet: { type: String },
    intake: { type: [[Number]], default: [] },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
