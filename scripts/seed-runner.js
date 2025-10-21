const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/somativa-biblioteca';

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  status: { type: String, default: 'Disponível' }
}, { timestamps: true });

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  memberId: String
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
  console.log('Connecting to', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  console.log('Clearing existing data...');
  await Book.deleteMany({});
  await Member.deleteMany({});
  await User.deleteMany({});

  console.log('Creating sample books and members...');
  const books = await Book.create([
    { title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', isbn: '978-954-0' },
    { title: 'Dom Casmurro', author: 'Machado de Assis', isbn: '978-954-1' },
    { title: 'A Metamorfose', author: 'Franz Kafka', isbn: '978-954-2' }
  ]);

  const members = await Member.create([
    { name: 'Maria Silva', email: 'maria@example.com', memberId: 'M0001' },
    { name: 'João Souza', email: 'joao@example.com', memberId: 'M0002' }
  ]);

  const hashAdmin = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: hashAdmin, role: 'admin' });

  const hashMember = await bcrypt.hash('member123', 10);
  const memberUser = await User.create({ name: 'Carlos Membro', email: 'carlos@example.com', password: hashMember, role: 'member' });

  console.log({ ok: true, books: books.length, members: members.length, admin: admin.email, member: memberUser.email });
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
