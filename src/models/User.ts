import mongoose, { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string; // hashed
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });

export const User = (mongoose.models.User as mongoose.Model<IUser>) || model<IUser>('User', UserSchema);

export default User;
