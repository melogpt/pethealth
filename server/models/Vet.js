import mongoose from 'mongoose';

const vetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contact_number: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Vet', vetSchema);

