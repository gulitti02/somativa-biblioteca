import { NextResponse } from 'next/server';
import { returnLoan } from '../../../../../controllers/loansController';
import { requireAdmin } from '../../../../../lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const body = await request.json().catch(() => ({}));
    const res = await returnLoan(params.id, body.returnDate ? new Date(body.returnDate) : undefined);
    return NextResponse.json({ data: res });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
