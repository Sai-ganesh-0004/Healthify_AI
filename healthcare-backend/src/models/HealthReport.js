const mongoose = require("mongoose");

const healthReportSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:        { type: String, required: true },
  summary:      { type: String },
  risk:         { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  advice:       { type: String },
  tags:         [String],
  symptoms:     [String],
  doctorName:   { type: String },
  hospitalName: { type: String },
  reportDate:   { type: String },
  fileName:     { type: String },
  fileType:     { type: String },
  fileData:     { type: String }, // base64 file data
}, { timestamps: true });

module.exports = mongoose.model("HealthReport", healthReportSchema);