"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Loan = any;

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [bookId, setBookId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [lres, bres, mres] = await Promise.all([
        fetch('/api/loans').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/books').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/members').then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setLoans(lres.data || []);
      setBooks(bres.data || []);
      setMembers(mres.data || []);
    } catch (err: any) {
      setError(String(err));
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/loans', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ bookId, memberId, dueDate }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Erro');
      setBookId(''); setMemberId(''); setDueDate('');
      fetchData();
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  async function handleReturn(id: string) {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loans/${id}/return`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' } });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Erro');
      fetchData();
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Empréstimos</h1>
      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <div>
          <label>Livro</label><br />
          <select value={bookId} onChange={e => setBookId(e.target.value)}>
            <option value="">-- selecione --</option>
            {books.map(b => <option key={b._id} value={b._id}>{b.title} ({b.status})</option>)}
          </select>
        </div>
        <div>
          <label>Membro</label><br />
          <select value={memberId} onChange={e => setMemberId(e.target.value)}>
            <option value="">-- selecione --</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label>Due Date</label><br />
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}><button type="submit">Registrar Empréstimo</button></div>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <h2>Lista de Empréstimos</h2>
      <table style={{ width: '100%' }}>
        <thead><tr><th>Livro</th><th>Membro</th><th>LoanDate</th><th>DueDate</th><th>Return</th></tr></thead>
        <tbody>
          {loans.map((l:any) => (
            <tr key={l._id}>
              <td>{l.book?.title || '—'}</td>
              <td>{l.member?.name || '—'}</td>
              <td>{new Date(l.loanDate).toLocaleDateString()}</td>
              <td>{new Date(l.dueDate).toLocaleDateString()}</td>
              <td>{l.returnDate ? 'Devolvido' : <button onClick={() => handleReturn(l._id)}>Registrar devolução</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16 }}><Link href="/">← Voltar</Link></div>
    </div>
  );
}
