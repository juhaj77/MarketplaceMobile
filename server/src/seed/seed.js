import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_marketplace';

async function run() {
  await mongoose.connect(MONGO_URI);
  // Clean
  await Promise.all([User.deleteMany({}), Product.deleteMany({})]);

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

  const passwordHash = await bcrypt.hash('password123', saltRounds);

  const users = await User.insertMany([
    { displayName: 'Alice', email: 'alice@example.com', passwordHash },
    { displayName: 'Bob', email: 'bob@example.com', passwordHash },
  ]);

  const [alice, bob] = users;

  await Product.insertMany([
    {
      title: 'Vintage Chair',
      description: 'A comfy vintage chair in good condition.',
      price: 49.99,
      owner: alice._id,
    },
    {
      title: 'Mountain Bike',
      description: '27.5" wheels, ready for trails.',
      price: 299.0,
      owner: bob._id,
    },
  ]);

  // eslint-disable-next-line no-console
  console.log('Seed completed. Users: alice@example.com / bob@example.com, password: password123');
  await mongoose.disconnect();
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
