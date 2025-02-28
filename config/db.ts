import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/notehub";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // 退出进程
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
};

// 处理连接错误
mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

// 处理连接断开
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});