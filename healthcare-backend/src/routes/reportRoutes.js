const express = require("express");
const router = express.Router();
const {
  getHealthReports,
  getReportById,
  createReport,
  deleteReport,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getHealthReports);
router.get("/:id", protect, getReportById);
router.post("/", protect, createReport);
router.delete("/:id", protect, deleteReport);

module.exports = router;