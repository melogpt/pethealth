import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Login (Hem doktor hem pet owner için)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username }); // Debug log (password'ü loglamıyoruz)
    
    // Basit kontrol: Parametreler eksik mi?
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    try {
      // MongoDB'de kullanıcıyı bul
      const user = await User.findOne({ username, password });
      
      if (!user) {
        console.log('Invalid credentials for user:', username);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      console.log('User found:', { id: user._id, type: user.user_type });
      
      // Başarılı login
      return res.json({ 
        success: true, 
        user: {
          id: user._id,
          username: user.username,
          user_type: user.user_type
        }
      });
    } catch (queryError) {
      console.error('Query error:', queryError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database query error', 
        error: queryError.message 
      });
    }
  } catch (error) {
    console.error('Unexpected login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router; 
