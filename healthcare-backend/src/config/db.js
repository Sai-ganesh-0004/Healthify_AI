const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    const hostInfo =
      conn.connection.host ||
      conn.connection?.client?.s?.url ||
      "Atlas Cluster";
    console.log(`✅ MongoDB Connected: ${hostInfo}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
