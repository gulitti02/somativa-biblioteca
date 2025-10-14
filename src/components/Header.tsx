"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    location.reload();
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #eee' }}>
      <div>
        <Link href="/">SGM Biblioteca</Link>
      </div>
      <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/books">Livros</Link>
        <Link href="/members">Membros</Link>
        <Link href="/loans">Empréstimos</Link>
        {user ? (
          <>
            <span>{user.name}</span>
            <button onClick={logout}>Sair</button>
          </>
        ) : (
          <>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Registrar</Link>
          </>
        )}
      </nav>
    </header>
  );
}
