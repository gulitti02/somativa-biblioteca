import mongoose, { Schema, model, Model } from 'mongoose';

export interface ILoan {
  book: mongoose.Types.ObjectId | string;
  member: mongoose.Types.ObjectId | string;
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date | null;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LoanSchema = new Schema<ILoan>({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  loanDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  notes: { type: String, required: false },
}, { timestamps: true });

export const Loan: Model<ILoan> = (mongoose.models.Loan as Model<ILoan>) || model<ILoan>('Loan', LoanSchema);

export default Loan;
