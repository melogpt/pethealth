import express from 'express';
import cors from 'cors';
import mongoose from './config/db.js'; // MongoDB bağlantısı
import authRoutes from './routes/auth.js';
import petsRoutes from './routes/pets.js';
import chatRoutes from './routes/chat.js';

const app = express();
const port = process.env.PORT || 5001; // 3306 MySQL için ayrılmış bir port

console.log('Starting server initialization...');

// CORS ayarları - tüm isteklere izin ver
app.use(cors({
  origin: '*', // Tüm domainlerden gelen isteklere izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('CORS configured');

app.use(express.json());
console.log('JSON parser configured');

// Test endpoint - Veritabanı bağlantısını test et
app.get('/api/db-test', async (req, res) => {
  console.log('Received DB test request');
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log('MongoDB connection state:', states[state]);
    res.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      state: states[state],
      database: mongoose.connection.name
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Routes
app.use('/api', authRoutes); // /api/login endpointi için
console.log('Auth routes configured');

app.use('/api/pets', petsRoutes);
console.log('Pet routes configured');

app.use('/api/chat', chatRoutes);
console.log('Chat routes configured');

// Basic test endpoint
app.get('/api/test', (req, res) => {
  console.log('Received test request');
  res.json({ message: 'Server is running!' });
});

// Doğrudan users collection'ını kontrol eden test endpoint
app.get('/api/users-test', async (req, res) => {
  console.log('Received users test request');
  try {
    const User = (await import('./models/User.js')).default;
    const users = await User.find().limit(5).lean();
    console.log('Users test successful, count:', users.length);
    res.json({ 
      success: true, 
      count: users.length,
      users: users.map(u => ({ id: u._id, username: u.username, user_type: u.user_type }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} with host 0.0.0.0`);
  console.log(`Login endpoint: http://localhost:${port}/api/login`);
  console.log(`Database test: http://localhost:${port}/api/db-test`);
  console.log(`Users test: http://localhost:${port}/api/users-test`);
});