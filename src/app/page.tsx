import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>SGM — Biblioteca Comunitária "Ler é Viver"</h1>
        <p>Pequeno sistema para gerenciar acervo, membros e empréstimos.</p>

        <div className={styles.ctas}>
          <Link href="/books" className={styles.primary}>Acervo (Livros)</Link>
          <Link href="/members" className={styles.secondary}>Membros</Link>
          <Link href="/loans" className={styles.secondary}>Empréstimos</Link>
        </div>

        <section style={{ marginTop: 32, maxWidth: 720 }}>
          <h2>Visão geral do MVP</h2>
          <ul>
            <li>CRUD de livros</li>
            <li>CRUD de membros</li>
            <li>Registrar empréstimos e devoluções</li>
            <li>Listagem de empréstimos atrasados</li>
          </ul>
        </section>
      </main>
      <footer className={styles.footer}>
        <div>DevSolutions — Projeto de aula</div>
      </footer>
    </div>
  );
}
