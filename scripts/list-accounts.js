const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/somativa-biblioteca';

async function run() {
  console.log('Connecting to', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // users collection
  try {
    const users = await db.collection('users').find({}).project({ email: 1, name: 1, role: 1, memberId: 1 }).toArray();
    console.log('\nUsers:');
    users.forEach(u => {
      console.log(`- email: ${u.email || '-'} | name: ${u.name || '-'} | role: ${u.role || '-'} | memberId: ${u.memberId || '-'} `);
    });
  } catch (e) {
    console.error('Error fetching users:', e.message);
  }

  // members collection
  try {
    const members = await db.collection('members').find({}).project({ email: 1, name: 1, memberId: 1 }).toArray();
    console.log('\nMembers:');
    members.forEach(m => {
      console.log(`- email: ${m.email || '-'} | name: ${m.name || '-'} | memberId: ${m.memberId || '-'} `);
    });
  } catch (e) {
    console.error('Error fetching members:', e.message);
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
