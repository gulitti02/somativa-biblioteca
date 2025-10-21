"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Error');
  // store token and user in localStorage for now
  localStorage.setItem('token', j.data.token);
  localStorage.setItem('user', JSON.stringify(j.data.user));
  router.push('/');
    } catch (err: any) {
      setError(err.message || String(err));
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button className="btn" type="submit">Entrar</button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
