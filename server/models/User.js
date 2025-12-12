import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    required: true,
    enum: ['doctor', 'pet-owner'],
    default: 'pet-owner'
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);

