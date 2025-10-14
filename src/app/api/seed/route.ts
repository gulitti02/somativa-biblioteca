import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Book from '../../../../models/Book';
import Member from '../../../../models/Member';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  // allow only in development
  if (process.env.NODE_ENV !== 'development') return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  await connectToDatabase();
  await Book.deleteMany({});
  await Member.deleteMany({});
  await User.deleteMany({});

  const books = await Book.create([
    { title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', isbn: '978-...' },
    { title: 'Dom Casmurro', author: 'Machado de Assis', isbn: '978-...' },
    { title: 'A Metamorfose', author: 'Franz Kafka', isbn: '978-...' },
  ]);

  const members = await Member.create([
    { name: 'Maria Silva', email: 'maria@example.com', memberId: 'M0001' },
    { name: 'João Souza', email: 'joao@example.com', memberId: 'M0002' },
  ]);

  const hash = await bcrypt.hash('admin123', 10);
  const user = await User.create({ name: 'Admin', email: 'admin@example.com', password: hash, role: 'admin' });

  return NextResponse.json({ ok: true, books: books.length, members: members.length, admin: user.email });
}
