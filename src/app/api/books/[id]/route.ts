import { NextResponse } from 'next/server';
import { getBook, updateBook, deleteBook } from '../../../../controllers/booksController';
import { requireAdmin } from '../../../../lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const book = await getBook(id || '');
    if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: book });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const book = await updateBook(id || '', body);
    if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: book });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const ok = await deleteBook(id || '');
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({}, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
