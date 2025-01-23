const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Wait until the connection is ready
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } else if (mongoose.connection.readyState === 1) {
      console.log("MongoDB connection already established");
    } else if (mongoose.connection.readyState === 2) {
      console.log("MongoDB is currently connecting...");
      await mongoose.connection.asPromise(); // Wait for connection
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process on failure
  }
};

module.exports = connectDB;
