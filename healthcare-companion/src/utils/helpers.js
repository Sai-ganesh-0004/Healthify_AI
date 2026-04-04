// Format date to readable string
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
};

// Format time from Date object
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Get initials from full name
export const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

// Get greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// Risk level color helper
export const getRiskColor = (level) => {
  switch (level) {
    case "Low":    return "var(--accent)";
    case "Medium": return "var(--warn)";
    case "High":   return "var(--danger)";
    default:       return "var(--text2)";
  }
};

// Calculate BMI
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);
  return bmi;
};

// BMI category
export const getBMICategory = (bmi) => {
  if (!bmi) return "";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal";
  if (bmi < 30)   return "Overweight";
  return "Obese";
};

// Truncate long text
export const truncate = (str, maxLen = 100) => {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
};

// Get token from localStorage
export const getToken = () => localStorage.getItem("token");

// Remove token (logout helper)
export const clearToken = () => localStorage.removeItem("token");