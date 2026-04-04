const User = require("../models/User");

// @POST /api/water/submit-daily
const submitDailyWaterIntake = async (req, res) => {
  try {
    const { calories, glasses } = req.body;

    if (calories === undefined || glasses === undefined) {
      return res
        .status(400)
        .json({ message: "Please provide calories and glasses" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.intake.push([parseInt(calories, 10), parseInt(glasses, 10)]);
    await user.save();

    const latestEntry = user.intake[user.intake.length - 1] || [];
    res.json({ message: "Daily entry saved", data: latestEntry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/water/today
const getTodayWaterIntake = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("intake");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const latestEntry = user.intake[user.intake.length - 1] || null;
    const record = latestEntry ? { data: latestEntry } : null;

    res.json({ record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/water/history
const getWaterIntakeHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("intake");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const records = (user.intake || [])
      .slice(-30)
      .reverse()
      .map((entry) => ({ data: entry }));

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitDailyWaterIntake,
  getTodayWaterIntake,
  getWaterIntakeHistory,
};
