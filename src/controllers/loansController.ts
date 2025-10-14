import { connectToDatabase } from '../lib/mongodb';
import Loan from '../models/Loan';
import Book from '../models/Book';
import Member from '../models/Member';
import { Types } from 'mongoose';

export async function listLoans(filter: any = {}, options: any = {}) {
  await connectToDatabase();
  const query: any = {};
  if (filter.active === 'true' || filter.active === true) query.returnDate = null;
  if (filter.overdue === 'true' || filter.overdue === true) {
    query.returnDate = null;
    query.dueDate = { $lt: new Date() };
  }

  const data = await Loan.find(query).populate('book').populate('member').sort({ loanDate: -1 }).lean();
  return { data };
}

export async function createLoan(payload: any) {
  await connectToDatabase();
  const { bookId, memberId, loanDate, dueDate, notes } = payload;

  if (!Types.ObjectId.isValid(bookId)) throw new Error('Invalid bookId');
  if (!Types.ObjectId.isValid(memberId)) throw new Error('Invalid memberId');

  const book = await Book.findById(bookId);
  if (!book) throw new Error('Book not found');
  if (book.status === 'Emprestado') throw new Error('Book already emprestado');

  // create loan and update book status
  const loan = await Loan.create({ book: bookId, member: memberId, loanDate: loanDate || new Date(), dueDate, notes });
  book.status = 'Emprestado';
  await book.save();

  return Loan.findById(loan._id).populate('book').populate('member').lean();
}

export async function returnLoan(loanId: string, returnDate?: Date) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(loanId)) throw new Error('Invalid loanId');

  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error('Loan not found');
  if (loan.returnDate) throw new Error('Loan already returned');

  loan.returnDate = returnDate || new Date();
  await loan.save();

  // update book status
  const book = await Book.findById(loan.book);
  if (book) {
    book.status = 'Disponível';
    await book.save();
  }

  return Loan.findById(loan._id).populate('book').populate('member').lean();
}
