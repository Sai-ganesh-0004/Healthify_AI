const express = require("express");
const router = express.Router();
const dietController = require("../controllers/dietController");
const { protect } = require("../middleware/authMiddleware");

router.get("/",        protect, dietController.getDietRecommendations);
router.post("/custom", protect, dietController.createCustomDiet);

module.exports = router;