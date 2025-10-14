import { connectToDatabase } from '../lib/mongodb';
import Member from '../models/Member';
import { Types } from 'mongoose';

export async function listMembers(options: any = {}) {
  await connectToDatabase();
  const page = parseInt(options.page || '1', 10);
  const limit = parseInt(options.limit || '20', 10);
  const skip = (page - 1) * limit;

  const data = await Member.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }).lean();
  const total = await Member.countDocuments();
  return { data, meta: { page, limit, total } };
}

export async function createMember(payload: any) {
  await connectToDatabase();
  const member = await Member.create(payload);
  return member.toObject();
}

export async function getMember(id: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return null;
  return Member.findById(id).lean();
}

export async function updateMember(id: string, payload: any) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return null;
  return Member.findByIdAndUpdate(id, payload, { new: true }).lean();
}

export async function deleteMember(id: string) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return false;
  await Member.findByIdAndDelete(id);
  return true;
}
