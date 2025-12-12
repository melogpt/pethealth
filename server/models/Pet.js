import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Other'],
    trim: true
  },
  race: {
    type: String,
    default: '',
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', ''],
    default: ''
  },
  birthdate: {
    type: Date,
    default: null
  },
  microchip_number: {
    type: String,
    default: '',
    index: true
  },
  completed_vaccinations: {
    type: String,
    default: ''
  },
  scheduled_vaccinations: {
    type: String,
    default: ''
  },
  allergy: {
    type: String,
    default: ''
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetOwner',
    required: true
  },
  vet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vet',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
petSchema.index({ microchip_number: 1 });
petSchema.index({ type: 1 });
petSchema.index({ owner_id: 1 });

export default mongoose.model('Pet', petSchema);

