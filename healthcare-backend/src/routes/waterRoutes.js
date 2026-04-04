const express = require("express");
const {
  submitDailyWaterIntake,
  getTodayWaterIntake,
  getWaterIntakeHistory,
} = require("../controllers/waterController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/submit-daily", protect, submitDailyWaterIntake);
router.get("/today", protect, getTodayWaterIntake);
router.get("/history", protect, getWaterIntakeHistory);

module.exports = router;
