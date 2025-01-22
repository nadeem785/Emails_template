const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) { // Only connect if no connection exists
    try {
      await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      process.exit(1); // Exit the process on failure
    }
  } else {
    console.log("MongoDB connection already established");
  }
};

module.exports = connectDB;
