import { NextResponse } from 'next/server';
import { listLoans, createLoan } from '../../../controllers/loansController';
import { requireAdmin, requireAuth } from '../../../lib/auth';
import { validateLoan } from '../../../lib/validate';

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
    // allow any authenticated user (member or admin) to create a loan
    const user = requireAuth(request);
    const body = await request.json();
    const err = validateLoan(body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    // attach requester info for auditing if needed
    body.requestedBy = user.sub;
    const loan = await createLoan(body);
    return NextResponse.json({ data: loan }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
