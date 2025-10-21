"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Member = { _id: string; name: string; email?: string; phone?: string; memberId: string };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function fetchMembers() {
    try {
      const res = await fetch('/api/members');
      const j = await res.json();
      setMembers(j.data || []);
    } catch (err: any) {
      setError(String(err));
    }
  }

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) setUser(JSON.parse(raw));
    fetchMembers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ name, email, memberId }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Erro');
      setName(''); setEmail(''); setMemberId('');
      fetchMembers();
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Erro');
      }
      fetchMembers();
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  return (
    <div className="container">
      <div className="card">
      <h1>Membros</h1>
      {user?.role === 'admin' && (
        <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <div>
          <label>Nome</label><br />
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Email</label><br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Código (memberId)</label><br />
          <input value={memberId} onChange={(e) => setMemberId(e.target.value)} />
        </div>
          <div style={{ marginTop: 8 }}>
            <button className="btn" type="submit">Criar Membro</button>
          </div>
        </form>
    )}
      {error && <div className="error">{error}</div>}

      <ul>
        {members.map(m => (
          <li key={m._id}>{m.name} — <span className="muted">{m.memberId}</span> — {m.email || '—'} {user?.role === 'admin' ? <button className="btn" style={{ marginLeft: 8 }} onClick={() => handleDelete(m._id)}>Deletar</button> : null}</li>
        ))}
      </ul>

      <div style={{ marginTop: 16 }}>
        <Link href="/">← Voltar</Link>
      </div>
      </div>
    </div>
  );
}
