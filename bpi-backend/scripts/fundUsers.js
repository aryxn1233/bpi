const User = require('../src/models/User');
const mongoose = require('mongoose');
require('dotenv').config();

async function fundUsers() {
  try {
    console.log('💰 Funding user accounts...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bpi-backend');
    console.log('✅ Connected to MongoDB');

    const query = { isActive: true };
    const handleArg = process.argv[2];
    if (handleArg) {
      query.bpiHandle = handleArg.toLowerCase();
      console.log(` Funding single user: ${handleArg}`);
    }

    // Update users with initial balance
    const result = await User.updateMany(
      query,
      { balance: 10000 }
    );

    console.log(`✅ Funded ${result.modifiedCount} users with 10,000 tINR each`);

    // Show current users
    const users = await User.find({ isActive: true }).select('name bpiHandle balance');
    console.log('\n👥 Current Users:');
    users.forEach(user => {
      console.log(`   ${user.name} (${user.bpiHandle}): ₹${user.balance.toLocaleString()}`);
    });

    console.log('\n🎉 All users have been funded successfully!');
    console.log('💡 You can now make payments between users in the application.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error funding users:', error.message);
    process.exit(1);
  }
}

fundUsers();
