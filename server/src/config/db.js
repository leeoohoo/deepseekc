import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://deepseek_user:KY4mWEbDFoIpk3JU@localhost:27017/deepseek_cli_website?authSource=admin';

/**
 * Connect to MongoDB with retry logic
 */
export const connectDB = async () => {
  try {
    // Parse URI to ensure authSource is passed
    const conn = await mongoose.connect(MONGODB_URI, {
      // mongoose v8 options (useNewUrlParser and useUnifiedTopology are default true)
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Gracefully disconnect from MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error(`❌ MongoDB Disconnection Error: ${error.message}`);
  }
};

/**
 * Check if MongoDB is connected
 */
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Export mongoose instance for direct use if needed
export { mongoose };