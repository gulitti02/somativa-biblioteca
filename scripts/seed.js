const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/somativa-biblioteca';
  await mongoose.connect(uri);
  const { default: Book } = require('../src/models/Book');
  const { default: Member } = require('../src/models/Member');
  const { User } = require('../src/models/User');

  await Book.deleteMany({});
  await Member.deleteMany({});
  await User.deleteMany({});

  const books = await Book.create([
    { title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', isbn: '978-...'},
    { title: 'Dom Casmurro', author: 'Machado de Assis', isbn: '978-...'},
    { title: 'A Metamorfose', author: 'Franz Kafka', isbn: '978-...'},
  ]);

  const members = await Member.create([
    { name: 'Maria Silva', email: 'maria@example.com', memberId: 'M0001' },
    { name: 'João Souza', email: 'joao@example.com', memberId: 'M0002' },
  ]);

  const hash = await bcrypt.hash('admin123', 10);
  const user = await User.create({ name: 'Admin', email: 'admin@example.com', password: hash, role: 'admin' });

  console.log('Seed completed');
  console.log({ books: books.length, members: members.length, admin: user.email });
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
