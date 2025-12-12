import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Configuring MongoDB connection...');

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_health_db';

console.log(`MongoDB URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`); // Hide password in logs

let isConnected = false;

// Connect to MongoDB
async function connectDB() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    isConnected = conn.connections[0].readyState === 1;
    
    if (isConnected) {
      console.log('✅ MongoDB connection successful!');
      console.log(`Database: ${conn.connection.name}`);
      console.log(`Host: ${conn.connection.host}:${conn.connection.port}`);
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Initialize connection
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

export default mongoose;
