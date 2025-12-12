import mongoose from './config/db.js';
import Pet from './models/Pet.js';
import PetOwner from './models/PetOwner.js';
import Vet from './models/Vet.js';
import dotenv from 'dotenv';

dotenv.config();

const samplePets = [
  {
    pet: {
      name: 'Max',
      type: 'Dog',
      race: 'Golden Retriever',
      gender: 'Male',
      birthdate: '2020-05-15',
      microchip_number: 'DOG001',
      completed_vaccinations: 'Rabies, DHPP, Bordatella',
      scheduled_vaccinations: 'Rabies (2025-05-15)',
      allergy: 'None'
    },
    owner: {
      name: 'Ahmet Yılmaz',
      contact_number: '5321112233'
    },
    vet: {
      name: 'Dr. Veteriner Ahmet',
      contact_number: '5551112233'
    }
  },
  {
    pet: {
      name: 'Luna',
      type: 'Cat',
      race: 'British Shorthair',
      gender: 'Female',
      birthdate: '2019-03-20',
      microchip_number: 'CAT001',
      completed_vaccinations: 'FVRCP, Rabies',
      scheduled_vaccinations: 'FVRCP (2025-03-20)',
      allergy: 'Dairy products'
    },
    owner: {
      name: 'Ayşe Demir',
      contact_number: '5332223344'
    },
    vet: {
      name: 'Dr. Veteriner Ayşe',
      contact_number: '5552223344'
    }
  },
  {
    pet: {
      name: 'Bella',
      type: 'Dog',
      race: 'German Shepherd',
      gender: 'Female',
      birthdate: '2021-08-10',
      microchip_number: 'DOG002',
      completed_vaccinations: 'Rabies, DHPP',
      scheduled_vaccinations: 'DHPP (2025-08-10)',
      allergy: 'Chicken'
    },
    owner: {
      name: 'Mehmet Kaya',
      contact_number: '5343334455'
    },
    vet: {
      name: 'Dr. Veteriner Ahmet',
      contact_number: '5551112233'
    }
  },
  {
    pet: {
      name: 'Charlie',
      type: 'Cat',
      race: 'Persian',
      gender: 'Male',
      birthdate: '2020-11-25',
      microchip_number: 'CAT002',
      completed_vaccinations: 'FVRCP, Rabies, FeLV',
      scheduled_vaccinations: 'Rabies (2025-11-25)',
      allergy: 'None'
    },
    owner: {
      name: 'Fatma Şahin',
      contact_number: '5354445566'
    },
    vet: {
      name: 'Dr. Veteriner Ayşe',
      contact_number: '5552223344'
    }
  },
  {
    pet: {
      name: 'Rocky',
      type: 'Dog',
      race: 'Bulldog',
      gender: 'Male',
      birthdate: '2019-07-08',
      microchip_number: 'DOG003',
      completed_vaccinations: 'Rabies, DHPP, Bordatella',
      scheduled_vaccinations: 'Bordatella (2025-07-08)',
      allergy: 'Grain'
    },
    owner: {
      name: 'Ali Öztürk',
      contact_number: '5365556677'
    },
    vet: {
      name: 'Dr. Veteriner Mehmet',
      contact_number: '5553334455'
    }
  },
  {
    pet: {
      name: 'Tweety',
      type: 'Bird',
      race: 'Canary',
      gender: 'Male',
      birthdate: '2022-01-12',
      microchip_number: 'BRD001',
      completed_vaccinations: 'None',
      scheduled_vaccinations: 'Annual checkup (2025-01-12)',
      allergy: 'None'
    },
    owner: {
      name: 'Zeynep Arslan',
      contact_number: '5376667788'
    },
    vet: {
      name: 'Dr. Veteriner Ahmet',
      contact_number: '5551112233'
    }
  },
  {
    pet: {
      name: 'Daisy',
      type: 'Dog',
      race: 'Beagle',
      gender: 'Female',
      birthdate: '2021-04-30',
      microchip_number: 'DOG004',
      completed_vaccinations: 'Rabies, DHPP',
      scheduled_vaccinations: 'Rabies (2025-04-30)',
      allergy: 'None'
    },
    owner: {
      name: 'Can Yıldız',
      contact_number: '5387778899'
    },
    vet: {
      name: 'Dr. Veteriner Ayşe',
      contact_number: '5552223344'
    }
  },
  {
    pet: {
      name: 'Milo',
      type: 'Cat',
      race: 'Siamese',
      gender: 'Male',
      birthdate: '2020-09-18',
      microchip_number: 'CAT003',
      completed_vaccinations: 'FVRCP, Rabies',
      scheduled_vaccinations: 'FVRCP (2025-09-18)',
      allergy: 'Fish'
    },
    owner: {
      name: 'Elif Çelik',
      contact_number: '5398889900'
    },
    vet: {
      name: 'Dr. Veteriner Mehmet',
      contact_number: '5553334455'
    }
  },
  {
    pet: {
      name: 'Bunny',
      type: 'Rabbit',
      race: 'Holland Lop',
      gender: 'Female',
      birthdate: '2022-06-05',
      microchip_number: 'RBT001',
      completed_vaccinations: 'None',
      scheduled_vaccinations: 'Annual checkup (2025-06-05)',
      allergy: 'None'
    },
    owner: {
      name: 'Burak Aydın',
      contact_number: '5409990011'
    },
    vet: {
      name: 'Dr. Veteriner Ahmet',
      contact_number: '5551112233'
    }
  },
  {
    pet: {
      name: 'Cooper',
      type: 'Dog',
      race: 'Labrador Retriever',
      gender: 'Male',
      birthdate: '2021-12-22',
      microchip_number: 'DOG005',
      completed_vaccinations: 'Rabies, DHPP, Bordatella, Lyme',
      scheduled_vaccinations: 'Lyme (2025-12-22)',
      allergy: 'None'
    },
    owner: {
      name: 'Selin Doğan',
      contact_number: '5410001122'
    },
    vet: {
      name: 'Dr. Veteriner Ayşe',
      contact_number: '5552223344'
    }
  },
  {
    pet: {
      name: 'Nala',
      type: 'Cat',
      race: 'Maine Coon',
      gender: 'Female',
      birthdate: '2019-10-14',
      microchip_number: 'CAT004',
      completed_vaccinations: 'FVRCP, Rabies, FeLV',
      scheduled_vaccinations: 'FeLV (2025-10-14)',
      allergy: 'None'
    },
    owner: {
      name: 'Emre Koç',
      contact_number: '5421112233'
    },
    vet: {
      name: 'Dr. Veteriner Ahmet',
      contact_number: '5551112233'
    }
  },
  {
    pet: {
      name: 'Zeus',
      type: 'Dog',
      race: 'Rottweiler',
      gender: 'Male',
      birthdate: '2020-02-28',
      microchip_number: 'DOG006',
      completed_vaccinations: 'Rabies, DHPP',
      scheduled_vaccinations: 'DHPP (2025-02-28)',
      allergy: 'Beef'
    },
    owner: {
      name: 'Deniz Yıldırım',
      contact_number: '5432223344'
    },
    vet: {
      name: 'Dr. Veteriner Mehmet',
      contact_number: '5553334455'
    }
  },
  {
    pet: {
      name: 'Polly',
      type: 'Bird',
      race: 'Parrot',
      gender: 'Female',
      birthdate: '2021-05-17',
      microchip_number: 'BRD002',
      completed_vaccinations: 'None',
      scheduled_vaccinations: 'Annual checkup (2025-05-17)',
      allergy: 'None'
    },
    owner: {
      name: 'Cem Özdemir',
      contact_number: '5443334455'
    },
    vet: {
      name: 'Dr. Veteriner Ayşe',
      contact_number: '5552223344'
    }
  },
  {
    pet: {
      name: 'Simba',
      type: 'Cat',
      race: 'Bengal',
      gender: 'Male',
      birthdate: '2021-07-03',
      microchip_number: 'CAT005',
      completed_vaccinations: 'FVRCP, Rabies',
      scheduled_vaccinations: 'Rabies (2025-07-03)',
      allergy: 'None'
    },
    owner: {
      name: 'Gizem Avcı',
      contact_number: '5454445566'
    },
    vet: {
      name: 'Dr. Veteriner Ahmet',
      contact_number: '5551112233'
    }
  },
  {
    pet: {
      name: 'Lucky',
      type: 'Dog',
      race: 'Poodle',
      gender: 'Male',
      birthdate: '2022-03-11',
      microchip_number: 'DOG007',
      completed_vaccinations: 'Rabies, DHPP',
      scheduled_vaccinations: 'DHPP (2025-03-11)',
      allergy: 'None'
    },
    owner: {
      name: 'Kerem Şimşek',
      contact_number: '5465556677'
    },
    vet: {
      name: 'Dr. Veteriner Ayşe',
      contact_number: '5552223344'
    }
  }
];

async function addSamplePets() {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
        setTimeout(resolve, 5000); // Timeout after 5 seconds
      });
    }

    console.log('Starting to add sample pets...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const sample of samplePets) {
      try {
        // Check if pet with this microchip already exists
        const existingPet = await Pet.findOne({ microchip_number: sample.pet.microchip_number });

        if (existingPet) {
          console.log(`⏭️  Skipping ${sample.pet.name} (${sample.pet.microchip_number}) - already exists`);
          skippedCount++;
          continue;
        }

        // Find or create owner
        let owner = await PetOwner.findOne({
          name: sample.owner.name,
          contact_number: sample.owner.contact_number
        });

        if (!owner) {
          owner = await PetOwner.create(sample.owner);
        }

        // Find or create vet
        let vet = await Vet.findOne({
          name: sample.vet.name,
          contact_number: sample.vet.contact_number
        });

        if (!vet) {
          vet = await Vet.create(sample.vet);
        }

        // Create pet
        const pet = await Pet.create({
          ...sample.pet,
          birthdate: sample.pet.birthdate ? new Date(sample.pet.birthdate) : null,
          owner_id: owner._id,
          vet_id: vet._id
        });

        console.log(`✅ Added: ${pet.name} (${pet.type} - ${pet.race}) - Microchip: ${pet.microchip_number}`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding ${sample.pet.name}:`, error.message);
      }
    }

    console.log(`\n✨ Done! Added ${addedCount} pets, skipped ${skippedCount} duplicates.`);
    process.exit(0);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

addSamplePets();

