import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Disable automatic session usage for standalone MongoDB
      autoIndex: true,
    });
    
    // Disable automatic session usage globally
    mongoose.set('autoCreate', true);
    mongoose.set('autoIndex', true);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
