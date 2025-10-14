import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  // In a real app we would throw, but during SSR builds it's okay to continue.
  console.warn('MONGODB_URI not set. Some features will not work locally.');
}

let cached: { conn: typeof mongoose | null } = { conn: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) return mongoose;

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    cached.conn = conn;
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

export default mongoose;
