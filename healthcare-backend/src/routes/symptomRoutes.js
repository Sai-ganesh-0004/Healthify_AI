const express = require("express");
const router = express.Router();
const { predictSymptoms, getSymptomHistory } = require("../controllers/symptomController");
const { protect } = require("../middleware/authMiddleware");

router.post("/predict", protect, predictSymptoms);
router.get("/history",  protect, getSymptomHistory);

module.exports = router;