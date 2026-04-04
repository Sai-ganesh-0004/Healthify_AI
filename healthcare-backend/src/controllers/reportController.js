const HealthReport = require("../models/HealthReport");

const getHealthReports = async (req, res) => {
  try {
    const reports = await HealthReport.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-fileData"); // Don't send file data in list (too heavy)
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await HealthReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReport = async (req, res) => {
  try {
    const {
      title, summary, risk, symptoms, tags, advice,
      fileData, fileName, fileType,
      doctorName, hospitalName, reportDate,
    } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const report = await HealthReport.create({
      user:         req.user._id,
      title,
      summary:      summary || "",
      risk:         risk || "Low",
      symptoms:     symptoms || [],
      tags:         tags || [],
      advice:       advice || "",
      fileData:     fileData || "",
      fileName:     fileName || "",
      fileType:     fileType || "",
      doctorName:   doctorName || "",
      hospitalName: hospitalName || "",
      reportDate:   reportDate || "",
    });

    res.status(201).json({ message: "Report saved successfully", report });
  } catch (error) {
    console.error("Create report error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await HealthReport.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHealthReports, getReportById, createReport, deleteReport };