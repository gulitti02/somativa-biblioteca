import { NextResponse } from 'next/server';
import { listLoans, createLoan } from '../../../controllers/loansController';
import { requireAdmin } from '../../../lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const overdue = searchParams.get('overdue') || undefined;
    const active = searchParams.get('active') || undefined;
    const res = await listLoans({ overdue, active });
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const loan = await createLoan(body);
    return NextResponse.json({ data: loan }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
