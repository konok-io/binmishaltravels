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
    console.log('✓ Cleared existing data\n');

    // Create branches
    const branches = await Branch.insertMany([
      {
        code: 'HO',
        name: 'Head Office',
        nameAr: 'المقر الرئيسي',
        city: 'Riyadh',
        country: 'SA',
        address: 'King Fahd Road, Riyadh',
        phone: '+966-11-1234567',
        email: 'ho@binmishaltravels.com',
        isActive: true,
        isHeadOffice: true,
        status: 'active',
        managerName: 'Ahmed Al-Rashid',
        managerPhone: '+966-50-1234567',
      },
      {
        code: 'JED',
        name: 'Jeddah Branch',
        nameAr: 'فرع جدة',
        city: 'Jeddah',
        country: 'SA',
        address: 'Al-Madinah Road, Jeddah',
        phone: '+966-12-2345678',
        email: 'jeddah@binmishaltravels.com',
        isActive: true,
        isHeadOffice: false,
        status: 'active',
        managerName: 'Mohammed Hassan',
        managerPhone: '+966-50-2345678',
      },
      {
        code: 'DHB',
        name: 'Dhaka Branch',
        nameAr: 'فرع دكا',
        city: 'Dhaka',
        country: 'BD',
        address: 'Gulshan-2, Dhaka',
        phone: '+880-2-9876543',
        email: 'dhaka@binmishaltravels.com',
        isActive: true,
        isHeadOffice: false,
        status: 'active',
        managerName: 'Rahim Uddin',
        managerPhone: '+880-171-2345678',
      },
    ]);
    console.log('✓ Created branches:', branches.length);

    // Create users
    const users = await User.insertMany([
      {
        email: 'admin@binmishaltravels.com',
        password: 'admin123',
        name: 'System Administrator',
        nameAr: 'مدير النظام',
        phone: '+966-50-1111111',
        role: 'super_admin',
        isActive: true,
      },
      {
        email: 'manager.riyadh@binmishaltravels.com',
        password: 'manager123',
        name: 'Ahmed Al-Rashid',
        nameAr: 'أحمد الراشد',
        phone: '+966-50-2222222',
        role: 'branch_manager',
        branchId: branches[0]._id,
        isActive: true,
      },
      {
        email: 'staff.riyadh@binmishaltravels.com',
        password: 'staff123',
        name: 'Sara Al-Mohammed',
        nameAr: 'سارة المحمد',
        phone: '+966-50-3333333',
        role: 'branch_staff',
        branchId: branches[0]._id,
        isActive: true,
      },
    ]);
    console.log('✓ Created users:', users.length);

    // Create services
    const services = await Service.insertMany([
      {
        code: 'AIR',
        name: 'Air Ticket',
        nameBn: 'এয়ার টিকিট',
        nameAr: 'تذكرة طيران',
        category: 'air_ticket',
        icon: '✈️',
        description: 'Domestic and international air ticketing',
        isActive: true,
      },
      {
        code: 'CARGO',
        name: 'Cargo Service',
        nameBn: 'কার্গো সার্ভিস',
        nameAr: 'خدمات الشحن',
        category: 'cargo',
        icon: '📦',
        description: 'International cargo and freight services',
        isActive: true,
      },
      {
        code: 'VISA',
        name: 'Visa Processing',
        nameBn: 'ভিসা প্রসেসিং',
        nameAr: 'معالجة التأشيرات',
        category: 'visa',
        icon: '📋',
        description: 'All types of visa processing services',
        isActive: true,
      },
      {
        code: 'IQAMA',
        name: 'Iqama Services',
        nameBn: 'আইকামা সার্ভিস',
        nameAr: 'خدمات الإقامة',
        category: 'iqama',
        icon: '🪪',
        description: 'Iqama renewal, transfer and related services',
        isActive: true,
      },
      {
        code: 'JAWAZAT',
        name: 'Jawazat Services',
        nameBn: 'جوازات সার্ভিস',
        nameAr: 'خدمات الجوازات',
        category: 'jawazat',
        icon: '🛂',
        description: 'Passport services and Jawazat related work',
        isActive: true,
      },
      {
        code: 'UMRAH',
        name: 'Umrah Package',
        nameBn: 'উমরাহ প্যাকেজ',
        nameAr: 'باقة العمرة',
        category: 'umrah',
        icon: '🕋',
        description: 'Complete Umrah packages with visa and hotel',
        isActive: true,
      },
      {
        code: 'PASSPORT',
        name: 'Passport Services',
        nameBn: 'পাসপোর্ট সার্ভিস',
        nameAr: 'خدمات جوازات السفر',
        category: 'passport',
        icon: '📘',
        description: 'New passport, renewal and correction services',
        isActive: true,
      },
      {
        code: 'PRINT',
        name: 'Airport Print',
        nameBn: 'এয়ারপোর্ট প্রিন্ট',
        nameAr: 'طباعة المطار',
        category: 'airport_print',
        icon: '🖨️',
        description: 'Airport entry permit printing services',
        isActive: true,
      },
    ]);
    console.log('✓ Created services:', services.length);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Super Admin: admin@binmishaltravels.com / admin123');
    console.log('   Branch Manager: manager.riyadh@binmishaltravels.com / manager123');
    console.log('   Branch Staff: staff.riyadh@binmishaltravels.com / staff123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
