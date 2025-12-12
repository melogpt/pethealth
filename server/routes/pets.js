import express from 'express';
import Pet from '../models/Pet.js';
import PetOwner from '../models/PetOwner.js';
import Vet from '../models/Vet.js';

const router = express.Router();

// Get all pets (for all users)
router.get('/', async (req, res) => {
  try {
    const pets = await Pet.find()
      .populate('owner_id', 'name contact_number')
      .populate('vet_id', 'name contact_number')
      .lean();

    // Format response to match frontend expectations
    const formattedPets = pets.map(pet => ({
      ...pet,
      id: pet._id,
      owner_name: pet.owner_id?.name || '',
      owner_contact: pet.owner_id?.contact_number || '',
      vet_name: pet.vet_id?.name || '',
      vet_contact: pet.vet_id?.contact_number || ''
    }));

    res.json(formattedPets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get statistics for dashboard (MUST be before /:id route)
router.get('/stats', async (req, res) => {
  try {
    // Total pets count
    const totalPets = await Pet.countDocuments();

    // Pet type distribution
    const typeDistribution = await Pet.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Vaccination status
    const vaccinationStats = await Pet.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$completed_vaccinations', null] },
                    { $ne: ['$completed_vaccinations', ''] }
                  ]
                },
                1,
                0
              ]
            }
          },
          scheduled: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$scheduled_vaccinations', null] },
                    { $ne: ['$scheduled_vaccinations', ''] }
                  ]
                },
                1,
                0
              ]
            }
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $or: [
                        { $eq: ['$completed_vaccinations', null] },
                        { $eq: ['$completed_vaccinations', ''] }
                      ]
                    },
                    {
                      $or: [
                        { $eq: ['$scheduled_vaccinations', null] },
                        { $eq: ['$scheduled_vaccinations', ''] }
                      ]
                    }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Allergy statistics
    const allergyStats = await Pet.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          with_allergy: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$allergy', null] },
                    { $ne: ['$allergy', ''] }
                  ]
                },
                1,
                0
              ]
            }
          },
          no_allergy: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$allergy', null] },
                    { $eq: ['$allergy', ''] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Pets with allergies (detailed)
    const allergyDetails = await Pet.aggregate([
      {
        $match: {
          allergy: { $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$allergy',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          allergy: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Recent pets (last 5)
    const recentPets = await Pet.find()
      .populate('owner_id', 'name')
      .populate('vet_id', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedRecentPets = recentPets.map(pet => ({
      ...pet,
      id: pet._id,
      owner_name: pet.owner_id?.name || '',
      vet_name: pet.vet_id?.name || ''
    }));

    res.json({
      success: true,
      stats: {
        totalPets,
        typeDistribution: typeDistribution || [],
        vaccination: vaccinationStats[0] || { total: 0, completed: 0, scheduled: 0, pending: 0 },
        allergy: allergyStats[0] || { total: 0, with_allergy: 0, no_allergy: 0 },
        allergyDetails: allergyDetails || [],
        recentPets: formattedRecentPets || []
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message
    });
  }
});

// Get pet by ID (MUST be after /stats and /microchip routes)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is 'stats' or 'microchip' to avoid conflicts
    if (id === 'stats' || id === 'microchip') {
      return res.status(404).json({ success: false, message: 'Invalid pet ID' });
    }

    const pet = await Pet.findById(id)
      .populate('owner_id', 'name contact_number')
      .populate('vet_id', 'name contact_number')
      .lean();

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Format response
    const formattedPet = {
      ...pet,
      id: pet._id,
      owner_name: pet.owner_id?.name || '',
      owner_contact: pet.owner_id?.contact_number || '',
      vet_name: pet.vet_id?.name || '',
      vet_contact: pet.vet_id?.contact_number || ''
    };

    res.json(formattedPet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get pet by microchip number (for pet owners)
router.get('/microchip/:chipNumber', async (req, res) => {
  try {
    const { chipNumber } = req.params;
    console.log('Searching for pet with microchip number:', chipNumber);
    
    if (!chipNumber) {
      return res.status(400).json({ success: false, message: 'Microchip number is required' });
    }
    
    const pet = await Pet.findOne({ microchip_number: chipNumber })
      .populate('owner_id', 'name contact_number')
      .populate('vet_id', 'name contact_number')
      .lean();

    if (!pet) {
      return res.status(404).json({ success: false, message: 'No pet found with this microchip number' });
    }

    // Format response
    const formattedPet = {
      ...pet,
      id: pet._id,
      owner_name: pet.owner_id?.name || '',
      owner_contact: pet.owner_id?.contact_number || '',
      vet_name: pet.vet_id?.name || '',
      vet_contact: pet.vet_id?.contact_number || ''
    };

    res.json(formattedPet);
  } catch (error) {
    console.error('Error fetching pet by microchip:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add new pet
router.post('/', async (req, res) => {
  try {
    console.log('Adding new pet with data:', req.body);
    
    const {
      petName, petType, petRace, petGender, petBirthdate,
      petMicrochipNumber, completedVaccinations, scheduledVaccinations,
      allergy, petOwnerName, petOwnerContactNumber,
      vetName, vetContactNumber,
      clinicName, clinicContactNumber
    } = req.body;

    // Input validation
    if (!petName || !petType || !petOwnerName) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    try {
      // Find or create pet owner
      let owner = await PetOwner.findOne({ 
        name: petOwnerName, 
        contact_number: petOwnerContactNumber || '' 
      });

      if (!owner) {
        owner = await PetOwner.create({
          name: petOwnerName,
          contact_number: petOwnerContactNumber || ''
        });
        console.log('Pet owner created, ID:', owner._id);
      } else {
        console.log('Pet owner found, ID:', owner._id);
      }

      // Find or create vet
      let vet = null;
      if (vetName) {
        vet = await Vet.findOne({ 
          name: vetName, 
          contact_number: vetContactNumber || '' 
        });

        if (!vet) {
          vet = await Vet.create({
            name: vetName,
            contact_number: vetContactNumber || ''
          });
          console.log('Vet created, ID:', vet._id);
        } else {
          console.log('Vet found, ID:', vet._id);
        }
      }

      // Create pet
      const pet = await Pet.create({
        name: petName,
        type: petType,
        race: petRace || '',
        gender: petGender || '',
        birthdate: petBirthdate ? new Date(petBirthdate) : null,
        microchip_number: petMicrochipNumber || '',
        completed_vaccinations: completedVaccinations || '',
        scheduled_vaccinations: scheduledVaccinations || '',
        allergy: allergy || '',
        owner_id: owner._id,
        vet_id: vet?._id || null
      });

      console.log('Pet created, ID:', pet._id);

      res.status(201).json({
        success: true,
        id: pet._id,
        message: 'Pet added successfully'
      });
    } catch (dbError) {
      console.error('Database error adding pet:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update pet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      petName, petType, petRace, petGender, petBirthdate,
      petMicrochipNumber, completedVaccinations, scheduledVaccinations,
      allergy, petOwnerName, petOwnerContactNumber,
      vetName, vetContactNumber,
      clinicName, clinicContactNumber
    } = req.body;

    // Find pet
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Update pet
    pet.name = petName;
    pet.type = petType;
    pet.race = petRace || '';
    pet.gender = petGender || '';
    pet.birthdate = petBirthdate ? new Date(petBirthdate) : null;
    pet.microchip_number = petMicrochipNumber || '';
    pet.completed_vaccinations = completedVaccinations || '';
    pet.scheduled_vaccinations = scheduledVaccinations || '';
    pet.allergy = allergy || '';

    await pet.save();

    // Update owner
    if (pet.owner_id) {
      const owner = await PetOwner.findById(pet.owner_id);
      if (owner) {
        owner.name = petOwnerName;
        owner.contact_number = petOwnerContactNumber || '';
        await owner.save();
      }
    }

    // Update vet
    if (pet.vet_id && vetName) {
      const vet = await Vet.findById(pet.vet_id);
      if (vet) {
        vet.name = vetName;
        vet.contact_number = vetContactNumber || '';
        await vet.save();
      }
    }

    res.json({ success: true, message: 'Pet updated successfully' });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete pet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting pet with ID:', id);
    
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    
    const ownerId = pet.owner_id;
    const vetId = pet.vet_id;
    
    // Delete the pet
    await Pet.findByIdAndDelete(id);
    console.log('Pet deleted');
    
    // Delete the associated owner (if no other pets)
    if (ownerId) {
      const otherPets = await Pet.findOne({ owner_id: ownerId });
      if (!otherPets) {
        await PetOwner.findByIdAndDelete(ownerId);
        console.log('Owner deleted');
      }
    }
    
    // Delete the associated vet (if no other pets)
    if (vetId) {
      const otherPets = await Pet.findOne({ vet_id: vetId });
      if (!otherPets) {
        await Vet.findByIdAndDelete(vetId);
        console.log('Vet deleted');
      }
    }
    
    res.json({ success: true, message: 'Pet and associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during delete operation', 
      error: error.message 
    });
  }
});

export default router; 
