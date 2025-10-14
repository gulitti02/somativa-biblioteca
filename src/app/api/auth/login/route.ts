import { NextResponse } from 'next/server';
import { loginUser } from '../../../../controllers/authController';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await loginUser(body);
    return NextResponse.json({ data: res });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
