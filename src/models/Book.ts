import mongoose, { Schema, model, Model } from 'mongoose';

export interface IBook {
  title: string;
  author: string;
  isbn?: string;
  status: 'Disponível' | 'Emprestado';
  createdAt?: Date;
  updatedAt?: Date;
}

const BookSchema = new Schema<IBook>({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, required: false, trim: true },
  status: { type: String, enum: ['Disponível', 'Emprestado'], default: 'Disponível' },
}, { timestamps: true });

export const Book: Model<IBook> = (mongoose.models.Book as Model<IBook>) || model<IBook>('Book', BookSchema);

export default Book;
