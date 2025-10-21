import { NextResponse } from 'next/server';
import { listBooks, createBook } from '../../../controllers/booksController';
import { requireAdmin } from '../../../lib/auth';
import { validateBook } from '../../../lib/validate';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const res = await listBooks({ q, status }, { page, limit });
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const err = validateBook(body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    const book = await createBook(body);
    return NextResponse.json({ data: book }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
