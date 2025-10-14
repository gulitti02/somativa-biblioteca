import { NextResponse } from 'next/server';
import { listMembers, createMember } from '../../../controllers/membersController';
import { requireAdmin } from '../../../lib/auth';

export async function GET(request: Request) {
  try {
    const res = await listMembers();
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const member = await createMember(body);
    return NextResponse.json({ data: member }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
