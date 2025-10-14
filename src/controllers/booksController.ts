import { connectToDatabase } from '../lib/mongodb';
import Book from '../models/Book';
import { Types } from 'mongoose';

// In-memory fallback store used when MONGODB_URI is not configured.
type InMemoryBook = {
  _id: string;
  title: string;
  author: string;
  isbn?: string;
  status: 'Disponível' | 'Emprestado';
  createdAt: string;
  updatedAt: string;
};

const inMemoryBooks: InMemoryBook[] = [];

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function usingDatabase() {
  return Boolean(process.env.MONGODB_URI);
}

export async function listBooks(filter: any = {}, options: any = {}) {
  if (!usingDatabase()) {
    // simple filter/ pagination for in-memory store
    let items = inMemoryBooks.slice().reverse();
    if (filter.q) {
      const q = filter.q.toLowerCase();
      items = items.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    if (filter.status) items = items.filter((b) => b.status === filter.status);
    const page = parseInt(options.page || '1', 10);
    const limit = parseInt(options.limit || '20', 10);
    const skip = (page - 1) * limit;
    const data = items.slice(skip, skip + limit);
    return { data, meta: { page, limit, total: items.length } };
  }

  await connectToDatabase();
  const page = parseInt(options.page || '1', 10);
  const limit = parseInt(options.limit || '20', 10);
  const skip = (page - 1) * limit;

  const query: any = {};
  if (filter.q) {
    const re = new RegExp(filter.q, 'i');
    query.$or = [{ title: re }, { author: re }];
  }
  if (filter.status) query.status = filter.status;

  const [data, total] = await Promise.all([
    Book.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    Book.countDocuments(query),
  ]);

  return { data, meta: { page, limit, total } };
}

export async function createBook(payload: any) {
  if (!usingDatabase()) {
    const now = new Date().toISOString();
    const book: InMemoryBook = {
      _id: genId(),
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn,
      status: payload.status || 'Disponível',
      createdAt: now,
      updatedAt: now,
    };
    inMemoryBooks.push(book);
    return book as any;
  }

  await connectToDatabase();
  const book = await Book.create(payload);
  return book.toObject();
}

export async function getBook(id: string) {
  if (!usingDatabase()) {
    const item = inMemoryBooks.find((b) => b._id === id);
    return item || null;
  }

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return null;
  const book = await Book.findById(id).lean();
  return book;
}

export async function updateBook(id: string, payload: any) {
  if (!usingDatabase()) {
    const idx = inMemoryBooks.findIndex((b) => b._id === id);
    if (idx === -1) return null;
    inMemoryBooks[idx] = { ...inMemoryBooks[idx], ...payload, updatedAt: new Date().toISOString() } as InMemoryBook;
    return inMemoryBooks[idx] as any;
  }

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return null;
  const book = await Book.findByIdAndUpdate(id, payload, { new: true }).lean();
  return book;
}

export async function deleteBook(id: string) {
  if (!usingDatabase()) {
    const idx = inMemoryBooks.findIndex((b) => b._id === id);
    if (idx === -1) return false;
    if (inMemoryBooks[idx].status === 'Emprestado') throw new Error('Cannot delete an emprestado book');
    inMemoryBooks.splice(idx, 1);
    return true;
  }

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return false;
  // prevent delete if book is emprestado
  const book = await Book.findById(id);
  if (!book) return false;
  if (book.status === 'Emprestado') throw new Error('Cannot delete an emprestado book');
  await Book.findByIdAndDelete(id);
  return true;
}
