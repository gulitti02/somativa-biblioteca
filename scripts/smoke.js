const fetch = globalThis.fetch || require('node-fetch');

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForServer(base, attempts = 10, delay = 500) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(base + '/api/books');
      if (res.ok) return true;
    } catch (e) {
      // ignore and retry
    }
    await wait(delay);
  }
  return false;
}

async function run() {
  const base = 'http://127.0.0.1:3000';
  console.log('Waiting for server at', base);
  const ready = await waitForServer(base, 20, 500);
  if (!ready) {
    throw new Error('Server not reachable at ' + base);
  }

  console.log('Logging in as admin...');
  const ares = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }) });
  const ajson = await ares.json();
  console.log('admin login status', ares.status, ajson);

  console.log('Logging in as member...');
  const mres = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'carlos@example.com', password: 'member123' }) });
  const mjson = await mres.json();
  console.log('member login status', mres.status, mjson);

  if (ares.ok) {
    console.log('Admin creating a book...');
    const bookRes = await fetch(base + '/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ajson.data.token}` }, body: JSON.stringify({ title: 'Livro Teste Admin', author: 'Autor Teste' }) });
    console.log('create book status', bookRes.status, await bookRes.json().catch(() => ({})));
  }

  if (mres.ok) {
    console.log('Member creating loan...');
    // pick a book and member
    const books = await fetch(base + '/api/books').then(r => r.json()).catch(() => ({ data: [] }));
    const members = await fetch(base + '/api/members').then(r => r.json()).catch(() => ({ data: [] }));
    const bookId = (books.data && books.data[0] && books.data[0]._id) || null;
    const memberId = (members.data && members.data[0] && members.data[0]._id) || null;
    if (!bookId || !memberId) {
      console.log('No book/member available to create loan');
      return;
    }
    const loanRes = await fetch(base + '/api/loans', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mjson.data.token}` }, body: JSON.stringify({ bookId, memberId, dueDate: new Date(Date.now() + 7*24*3600*1000).toISOString() }) });
    console.log('create loan status', loanRes.status, await loanRes.json().catch(() => ({})));
  }
}

run().catch(err => { console.error('smoke failed', err); process.exit(1); });
