import mongoose, { Schema, model, Model } from 'mongoose';

export interface IMember {
  name: string;
  email?: string;
  phone?: string;
  memberId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MemberSchema = new Schema<IMember>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: false, trim: true },
  phone: { type: String, required: false, trim: true },
  memberId: { type: String, required: true, trim: true, unique: true },
}, { timestamps: true });

export const Member: Model<IMember> = (mongoose.models.Member as Model<IMember>) || model<IMember>('Member', MemberSchema);

export default Member;
