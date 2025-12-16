import mongoose from './config/db.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleUsers = [
  {
    username: 'doctor1',
    password: 'doctor123',
    user_type: 'doctor'
  },
  {
    username: 'doctor2',
    password: 'doctor456',
    user_type: 'doctor'
  },
  {
    username: 'vet_admin',
    password: 'admin123',
    user_type: 'doctor'
  },
  {
    username: 'petowner1',
    password: 'owner123',
    user_type: 'pet-owner'
  },
  {
    username: 'petowner2',
    password: 'owner456',
    user_type: 'pet-owner'
  }
];

async function resetUsersWithHashedPasswords() {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
        setTimeout(resolve, 5000);
      });
    }

    console.log('Starting to reset users with properly hashed passwords...\n');

    let updatedCount = 0;
    let createdCount = 0;

    for (const userData of sampleUsers) {
      try {
        // Find existing user
        const existingUser = await User.findOne({ username: userData.username });

        if (existingUser) {
          // Delete existing user
          await User.deleteOne({ username: userData.username });
          console.log(`🗑️  Deleted existing user: ${userData.username}`);
        }

        // Create new user (password will be automatically hashed by pre-save hook)
        const user = await User.create(userData);
        console.log(`✅ Created/Updated: ${user.username} (${user.user_type})`);
        
        if (existingUser) {
          updatedCount++;
        } else {
          createdCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${userData.username}:`, error.message);
      }
    }

    console.log(`\n✨ Done! Created ${createdCount} users, updated ${updatedCount} users.`);
    console.log('\n📝 Test credentials:');
    console.log('   Doctor: doctor1 / doctor123');
    console.log('   Doctor: doctor2 / doctor456');
    console.log('   Admin: vet_admin / admin123');
    console.log('   Pet Owner: petowner1 / owner123');
    console.log('   Pet Owner: petowner2 / owner456');
    
    process.exit(0);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

resetUsersWithHashedPasswords();

