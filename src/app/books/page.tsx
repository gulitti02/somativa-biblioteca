"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Book = {
  _id: string;
  title: string;
  author: string;
  isbn?: string;
  status?: string;
};

export default function BooksPage() {
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function fetchBooks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('Erro ao carregar livros');
      const payload = await res.json();
      const list = Array.isArray(payload) ? payload : payload.data || [];
      setBooks(list);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Erro ao deletar');
      }
      fetchBooks();
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) setUser(JSON.parse(raw));
    fetchBooks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !author.trim()) {
      setError('Título e autor são obrigatórios');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ title, author, isbn }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Erro ao criar livro');
      }
      setTitle('');
      setAuthor('');
      setIsbn('');
      fetchBooks();
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Acervo (Livros)</h1>
        <p className="muted">Gerencie livros: crie e veja a lista. (backend: /api/books)</p>

        {user?.role === 'admin' && (
          <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
            <div className="form-row">
              <label>Título</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Autor</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="form-row">
              <label>ISBN</label>
              <input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="btn" type="submit">Criar Livro</button>
            </div>
          </form>
        )}

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>ISBN</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 && (
                <tr>
                  <td colSpan={5}>Nenhum livro cadastrado.</td>
                </tr>
              )}
              {books.map((b) => (
                <tr key={b._id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn || '—'}</td>
                  <td>{b.status || '—'}</td>
                  <td>{user?.role === 'admin' ? <button className="btn" onClick={() => handleDelete(b._id)}>Deletar</button> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 16 }}>
          <Link href="/">← Voltar</Link>
        </div>
      </div>
    </div>
  );
}
