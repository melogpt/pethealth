import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  microchip_number: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'ai']
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
chatMessageSchema.index({ microchip_number: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);

