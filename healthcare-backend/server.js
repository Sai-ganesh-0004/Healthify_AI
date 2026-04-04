require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { preloadChatServices } = require("./src/services/chat/bootstrap");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
preloadChatServices().catch((error) => {
  console.error(`⚠️ Chat data preload failed: ${error.message}`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
