const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        role:    { type: String, enum: ["user", "assistant"] },
        content: { type: String },
        time:    { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);