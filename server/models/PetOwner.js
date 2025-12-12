import mongoose from 'mongoose';

const petOwnerSchema = new mongoose.Schema({
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

export default mongoose.model('PetOwner', petOwnerSchema);

