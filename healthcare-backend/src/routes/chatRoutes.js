const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, chatController.sendMessage);
router.post("/insights", protect, chatController.getChatInsights);
router.get("/history", protect, chatController.getChatHistory);

module.exports = router;
