import mongoose from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function hashExistingPasswords() {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
        setTimeout(resolve, 5000);
      });
    }

    console.log('Starting to hash existing passwords...\n');

    // Get all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('No users found in database.');
      process.exit(0);
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        const isAlreadyHashed = user.password.startsWith('$2a$') || 
                                 user.password.startsWith('$2b$') || 
                                 user.password.startsWith('$2y$');

        if (isAlreadyHashed) {
          console.log(`⏭️  Skipping ${user.username} - password already hashed`);
          skippedCount++;
          continue;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Update user with hashed password directly (bypass pre-save hook)
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        console.log(`✅ Hashed password for: ${user.username}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error hashing password for ${user.username}:`, error.message);
      }
    }

    console.log(`\n✨ Done! Updated ${updatedCount} users, skipped ${skippedCount} already hashed.`);
    process.exit(0);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

hashExistingPasswords();

