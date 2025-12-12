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

async function addSampleUsers() {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
        setTimeout(resolve, 5000); // Timeout after 5 seconds
      });
    }

    console.log('Starting to add sample users...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: userData.username });

        if (existingUser) {
          console.log(`⏭️  Skipping ${userData.username} - already exists`);
          skippedCount++;
          continue;
        }

        // Create user
        const user = await User.create(userData);

        console.log(`✅ Added: ${user.username} (${user.user_type})`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding ${userData.username}:`, error.message);
      }
    }

    console.log(`\n✨ Done! Added ${addedCount} users, skipped ${skippedCount} duplicates.`);
    
    // List all users
    const allUsers = await User.find().lean();
    console.log(`\n📋 Total users in database: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`   - ${u.username} (${u.user_type})`);
    });
    
    process.exit(0);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

addSampleUsers();

