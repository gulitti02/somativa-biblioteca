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
    // API may return { data: [...] } or directly an array
    const list = Array.isArray(payload) ? payload : payload.data || [];
    setBooks(list);
      // above fallback is defensive: API may return either {data: [...]} or [...]
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
    <div style={{ padding: 24 }}>
      <h1>Acervo (Livros)</h1>
      <p>Gerencie livros: crie e veja a lista. (backend: /api/books)</p>

      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <div>
          <label>Título</label>
          <br />
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Autor</label>
          <br />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div>
          <label>ISBN</label>
          <br />
          <input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Criar Livro</button>
        </div>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Título</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Autor</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>ISBN</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhum livro cadastrado.</td>
              </tr>
            )}
            {books.map((b) => (
                <tr key={b._id}>
                  <td style={{ padding: '8px 0' }}>{b.title}</td>
                  <td style={{ padding: '8px 0' }}>{b.author}</td>
                  <td style={{ padding: '8px 0' }}>{b.isbn || '—'}</td>
                  <td style={{ padding: '8px 0' }}>{b.status || '—'}</td>
                  <td style={{ padding: '8px 0' }}><button onClick={() => handleDelete(b._id)}>Deletar</button></td>
                </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 16 }}>
        {typeof window !== 'undefined' && !localStorage.getItem('token') ? (
          <>
            <Link href="/auth/login">Login</Link> • <Link href="/auth/register">Registrar</Link>
          </>
        ) : (
          <Link href="/">← Voltar</Link>
        )}
      </div>
    </div>
  );
}
