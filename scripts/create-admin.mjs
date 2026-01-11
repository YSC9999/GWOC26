import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Helper: simple .env parser (fallback if dotenv isn't installed)
function loadDotenv(envPath) {
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const l of lines) {
      const line = l.trim();
      if (!line || line.startsWith('#')) continue;
      const [key, ...rest] = line.split('=');
      const val = rest.join('=').trim().replace(/^"|"$/g, '');
      process.env[key.trim()] = process.env[key.trim()] || val;
    }
  } catch (e) {
    // ignore
  }
}

// Load .env if exists (search upward from cwd)
function findDotEnv(startDir) {
  let dir = startDir;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const cwd = process.cwd();
const foundEnv = findDotEnv(cwd) || findDotEnv(path.resolve(cwd, 'GWOC26'));
if (foundEnv) {
  console.log('Loaded .env from', foundEnv);
  loadDotenv(foundEnv);
} else {
  console.log('No .env found by search');
}

const MONGODB_URL = process.env.MONGODB_URL;
const MAIN_ADMIN_EMAIL = process.env.MAIN_ADMIN_EMAIL;

console.log('Using MONGODB_URL:', !!MONGODB_URL);
console.log('Using MAIN_ADMIN_EMAIL:', !!MAIN_ADMIN_EMAIL);

if (!MONGODB_URL) {
  console.error('MONGODB_URL is not set. Please set it in environment or .env');
  process.exit(1);
}
if (!MAIN_ADMIN_EMAIL) {
  console.error('MAIN_ADMIN_EMAIL is not set. Please set it in environment or .env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URL, { bufferCommands: false });
  const db = mongoose.connection.db;

  const email = MAIN_ADMIN_EMAIL;
  const exists = await db.collection('users').findOne({ email });
  if (exists) {
    console.log(`User with email ${email} already exists. No action taken.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // generate a strong-ish random password (12 chars)
  const password = (Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase()).slice(0, 12);
  const hashed = await bcrypt.hash(password, 10);

  const doc = {
    name: 'Main Admin',
    email,
    password: hashed,
    role: 'admin',
    addresses: [],
    wishlist: [],
    tier: 'tier-3',
    subscriptionActive: false,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection('users').insertOne(doc);
  console.log(`Created main admin: ${email}`);
  console.log(`Password: ${password}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error creating admin:', err);
  process.exit(1);
});