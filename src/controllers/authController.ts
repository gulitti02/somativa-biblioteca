import { connectToDatabase } from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-changeme';

export async function registerUser(payload: any) {
  await connectToDatabase();
  const { name, email, password, role } = payload;
  if (!name || !email || !password) throw new Error('Missing fields');
  const exists = await User.findOne({ email });
  if (exists) throw new Error('Email already registered');
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role: role || 'admin' });
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function loginUser(payload: any) {
  await connectToDatabase();
  const { email, password } = payload;
  if (!email || !password) throw new Error('Missing fields');
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');
  const token = jwt.sign({ sub: user._id.toString(), role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}
