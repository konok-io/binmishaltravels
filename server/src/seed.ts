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

    // Create only Super Admin
    const superAdmin = new User({
      email: 'admin@binmishal.com',
      password: 'admin123',
      name: 'Super Admin',
      nameAr: 'مدير سوبر',
      phone: '+966500000000',
      role: 'super_admin',
      permissions: [
        { resource: '*', actions: ['create', 'read', 'update', 'delete'] }
      ],
      isActive: true
    });

    await superAdmin.save();
    console.log('✓ Created Super Admin: admin@binmishal.com / admin123\n');

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Super Admin created successfully!');
    console.log('   Email: admin@binmishal.com');
    console.log('   Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
