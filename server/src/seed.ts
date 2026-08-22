import { connectDatabase } from './config/database.js';
import { Branch, User, Service } from './models/index.js';

const seedData = async () => {
  try {
    await connectDatabase();
    console.log('🌱 Starting seed process...\n');

    // Clear existing data
    await Branch.deleteMany({});
    await User.deleteMany({});
    await Service.deleteMany({});
    console.log('✓ Cleared all existing data\n');

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 No demo data created. Please create users from the admin panel.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
