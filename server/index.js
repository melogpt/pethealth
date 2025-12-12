import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import petRoutes from './routes/pets.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/pets', petRoutes);

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Login endpoint: http://localhost:${PORT}/api/login`);
  console.log(`Database test: http://localhost:${PORT}/api/db-test`);
  console.log(`Users test: http://localhost:${PORT}/api/users-test`);
}); 