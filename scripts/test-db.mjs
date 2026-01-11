import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

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
if (!MONGODB_URL) {
  console.error('MONGODB_URL not found in env');
  process.exit(1);
}

console.log('Testing Mongo connection to:', MONGODB_URL.includes('@') ? MONGODB_URL.split('@')[1] : MONGODB_URL);

(async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URL, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB, host:', conn.connection.host);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
})();