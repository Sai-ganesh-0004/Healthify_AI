import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
export const getUserProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};
export const updateUserProfile = async (data) => {
  const res = await api.put("/auth/profile", data);
  return res.data;
};

// SYMPTOMS
export const predictSymptoms = async (data) => {
  const res = await api.post("/symptoms/predict", data);
  return res.data;
};

// CHATBOT
export const sendChatMessage = async (data) => {
  const res = await api.post("/chat", data);
  return res.data;
};
export const getChatInsights = async (data) => {
  const res = await api.post("/chat/insights", data);
  return res.data;
};

// DIET
export const getDietRecommendations = async () => {
  const res = await api.get("/diet");
  return res.data;
};

// REPORTS
export const getHealthReports = async () => {
  const res = await api.get("/reports");
  return res.data;
};
export const getReportById = async (id) => {
  const res = await api.get(`/reports/${id}`);
  return res.data;
};
export const createReport = async (data) => {
  const res = await api.post("/reports", data);
  return res.data;
};
export const deleteReport = async (id) => {
  const res = await api.delete(`/reports/${id}`);
  return res.data;
};

// WATER INTAKE
export const submitDailyWaterIntake = async (data) => {
  const res = await api.post("/water/submit-daily", data);
  return res.data;
};
export const getTodayWaterIntake = async () => {
  const res = await api.get("/water/today");
  return res.data;
};
export const getWaterIntakeHistory = async () => {
  const res = await api.get("/water/history");
  return res.data;
};

export default api;
