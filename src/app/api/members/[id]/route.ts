import { NextResponse } from 'next/server';
import { getMember, updateMember, deleteMember } from '../../../../controllers/membersController';
import { requireAdmin } from '../../../../lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const member = await getMember(id || '');
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: member });
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
    const member = await updateMember(id || '', body);
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(request);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const ok = await deleteMember(id || '');
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({}, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
