import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  } catch (e) {}
}

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
if (foundEnv) loadDotenv(foundEnv);

const MONGODB_URL = process.env.MONGODB_URL;
const MAIN_ADMIN_EMAIL = process.env.MAIN_ADMIN_EMAIL;
let newPassword = process.argv[2] || process.env.MAIN_ADMIN_PASSWORD;

if (!MONGODB_URL) {
  console.error('MONGODB_URL is not set. Please set it in environment or .env');
  process.exit(1);
}
if (!MAIN_ADMIN_EMAIL) {
  console.error('MAIN_ADMIN_EMAIL is not set. Please set it in environment or .env');
  process.exit(1);
}
if (!newPassword) {
  console.error('Provide the new password as the first argument or set MAIN_ADMIN_PASSWORD in .env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URL, { bufferCommands: false, autoIndex: false });
  const db = mongoose.connection.db;
  const email = MAIN_ADMIN_EMAIL;
  const user = await db.collection('users').findOne({ email });
  if (!user) {
    console.error(`No user found with email ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.collection('users').updateOne({ _id: user._id }, { $set: { password: hashed, updatedAt: new Date() } });
  console.log(`Password for ${email} updated successfully.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => { console.error('Error resetting password:', err); process.exit(1); });