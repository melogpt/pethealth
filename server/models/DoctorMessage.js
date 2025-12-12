import mongoose from 'mongoose';

const doctorMessageSchema = new mongoose.Schema({
  microchip_number: {
    type: String,
    required: true,
    index: true
  },
  owner_name: {
    type: String,
    default: ''
  },
  owner_contact: {
    type: String,
    default: ''
  },
  pet_name: {
    type: String,
    default: ''
  },
  pet_type: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    required: true
  },
  pet_info: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'read'],
    default: 'pending',
    index: true
  },
  read_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
doctorMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('DoctorMessage', doctorMessageSchema);

