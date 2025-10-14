# SGM - Biblioteca Comunitária "Ler é Viver" (MVP)

Este repositório contém um projeto-base em Next.js (App Router) preparado para ser adaptado como um MVP de um Sistema de Gerenciamento de Biblioteca para a "Biblioteca Comunitária Ler é Viver".

O arquivo a seguir documenta em detalhes o escopo do MVP, modelagem de dados, rotas API, contratos (request/response), fluxos de uso, plano de testes, preocupações de segurança, roteiro de implementação, checklist de apresentação e sugestões de melhorias/bônus.

> Observação: este README foi expandido para ser uma especificação prática suficiente para orientar a implementação completa do MVP. Se desejar, posso começar a codificar os modelos e rotas a partir desta especificação.

---

## Sumário (versão rápida)

- Objetivo: substituir o controle manual de empréstimos por um pequeno sistema web.
- Usuários: Bibliotecário (gestor) e Membro (consulta pública).
- MVP: CRUD de livros, CRUD de membros, registro de empréstimos e devoluções, página de empréstimos atrasados.
- Bônus: busca por título/autor, relatórios simples.

---

## Contexto e justificativa

Bibliotecas comunitárias frequentemente não possuem ferramentas digitais para controlar o acervo e o fluxo de empréstimos. O uso de fichas físicas leva a perda de histórico, atrasos e baixa visibilidade do acervo. Um MVP simples com interface web melhora a rastreabilidade e reduz trabalho manual.

Requisitos de negócio resumidos:

- Registrar livros e membros.
- Registrar empréstimos e devoluções rapidamente.
- Identificar empréstimos atrasados.
- Manter histórico de operações para auditoria.

---

## Escopo detalhado do MVP

Funcionalidades obrigatórias (escopo de entrega mínima):

1. Livros
   - Listar, criar, editar e excluir livros.
   - Campos míninos: título, autor, ISBN, status.
   - Status controlado: "Disponível" ou "Emprestado".
2. Membros
   - Listar, criar, editar e excluir membros.
   - Campos mínimos: nome, email, telefone, código de membro (memberId).
3. Empréstimos
   - Registrar empréstimo: associa livro + membro + data empréstimo + data prevista de devolução.
   - Registrar devolução: setar data de devolução e atualizar status do livro para "Disponível".
   - Não permitir empréstimo se o livro já estiver "Emprestado".
4. Empréstimos atrasados
   - Página/endpoint que lista empréstimos cuja dueDate < hoje e returnDate == null.

Funcionalidades opcionais / bônus

- Busca por título/autor com parâmetros de query.
- Páginas de dashboard com métricas (quantidade de livros, livros emprestados, atrasados).
- Upload de capa de livro (simples) e importação CSV de livros.
- Autenticação/Autorização: proteger rotas de escrita com login (bibliotecário).

---

## Modelagem de dados (Mongoose) — especificação completa

A seguir estão os esquemas propostos. Detalhei tipos, índices e validações mínimas.

### Book (src/models/Book.ts)

Campos:
- _id: ObjectId (automático)
- title: { type: String, required: true, trim: true }
- author: { type: String, required: true, trim: true }
- isbn: { type: String, required: false, unique: false, trim: true }
- status: { type: String, enum: ['Disponível','Emprestado'], default: 'Disponível' }
- createdAt, updatedAt: timestamps

Índices sugeridos:
- index em title para busca por texto (ou full-text em campo title+author)

Validações/observações:
- ISBN opcional (nem todo livro comunitário tem ISBN).
- Ao deletar um livro que está emprestado, o endpoint deve rejeitar (integridade referencial de negócio).

### Member (src/models/Member.ts)

Campos:
- _id: ObjectId
- name: { type: String, required: true }
- email: { type: String, required: false }
- phone: { type: String, required: false }
- memberId: { type: String, required: true, unique: true } // código legível
- createdAt, updatedAt

Validações:
- `memberId` pode ser gerado automaticamente (por exemplo: 'M0001') ou informado.
- Email opcional; se informado, validação simples de formato.

### Loan (src/models/Loan.ts)

Campos:
- _id: ObjectId
- book: { type: ObjectId, ref: 'Book', required: true }
- member: { type: ObjectId, ref: 'Member', required: true }
- loanDate: { type: Date, default: Date.now }
- dueDate: { type: Date, required: true }
- returnDate: { type: Date, default: null }
- notes?: string
- createdAt, updatedAt

Comportamento de negócio:
- Ao criar um Loan, o status do Book referenciado deve ser atualizado para 'Emprestado'.
- Ao registrar return (set returnDate), o status do Book volta a 'Disponível'.
- Empréstimo não permitido se já existir Loan ativo para o mesmo livro (returnDate == null).

---

## Contrato das APIs (exemplos)

Os exemplos seguem a convenção JSON e usam rotas no padrão REST. Implementação pode ser em `src/app/api/...` (App Router) ou `src/pages/api` dependendo da preferência do projeto-base.

### Books

- GET /api/books
  - Query params: ?q=texto (busca), ?status=Disponível|Emprestado, ?page=1&limit=20
  - Response 200
  {
    "data": [ { "_id": "...", "title": "...", "author": "...", "isbn": "...", "status": "Disponível" } ],
    "meta": { "page": 1, "limit": 20, "total": 120 }
  }

- POST /api/books
  - Body
  {
    "title": "O Pequeno Príncipe",
    "author": "Antoine de Saint-Exupéry",
    "isbn": "978-...")
  }
  - Response 201 { "data": { ...book } }

- GET /api/books/:id -> 200 | 404
- PUT /api/books/:id -> 200 | 400 | 404
- DELETE /api/books/:id -> 204 | 400 (se emprestado) | 404

### Members

- GET /api/members
- POST /api/members
  - Body minimal: { "name":"...", "memberId":"M0001", "email":"..." }
- GET/PUT/DELETE similar a Books

### Loans

- GET /api/loans
  - Query params: ?overdue=true (retorna apenas atrasados), ?active=true (returnDate == null)
- POST /api/loans
  - Body: { "bookId": "<id>", "memberId": "<id>", "loanDate": "2025-10-14T00:00:00Z" (opcional), "dueDate": "2025-11-01T00:00:00Z" }
  - Response 201 {
      "data": { "_id": "...", "book": {"_id":"..","title":"..."}, "member": {...}, "loanDate":"...","dueDate":"...","returnDate":null }
    }
  - Business checks: book.status must be 'Disponível', dueDate > loanDate

- POST /api/loans/:id/return
  - Body optional: { "returnDate": "2025-10-20T00:00:00Z" }
  - Effects: set returnDate, set Book.status = 'Disponível'
  - Response 200 { "data": { ...loanWithReturn } }

---

## Exemplo de payloads (cURL)

Abaixo alguns exemplos para testar rapidamente via terminal (ajuste URL/local). Não execute aqui — são exemplos que você pode rodar localmente quando a API estiver pronta.

- Criar livro

curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"O Alquimista","author":"Paulo Coelho","isbn":"978..."}'

- Criar membro

curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","memberId":"M0001","email":"maria@ex.com"}'

- Registrar empréstimo

curl -X POST http://localhost:3000/api/loans \
  -H "Content-Type: application/json" \
  -d '{"bookId":"<BOOK_ID>","memberId":"<MEMBER_ID>","dueDate":"2025-11-01T00:00:00Z"}'

- Registrar devolução

curl -X POST http://localhost:3000/api/loans/<LOAN_ID>/return \
  -H "Content-Type: application/json" \
  -d '{"returnDate":"2025-10-20T00:00:00Z"}'

---

## Fluxos de uso (UX flows)

1. Bibliotecário cria cadastro de livro
   - Acessa página de livros -> Formulário "Novo livro" -> Submete -> Vê lista atualizada.
2. Bibliotecário cadastra membro
   - Página de membros -> Novo membro -> Submete -> recebe memberId (manual ou automático).
3. Registrar empréstimo
   - Página de empréstimos -> Novo empréstimo -> seleciona livro (dropdown ou busca) -> seleciona membro -> define dueDate -> submete.
   - Sistema valida disponibilidade do livro e cria Loan.
4. Registrar devolução
   - Na lista de empréstimos ativos, clicar "Registrar devolução" -> confirmar data -> livro volta a "Disponível".
5. Ver empréstimos atrasados
   - Página "Atrasados" lista casos com dueDate < today e returnDate == null.

---

## Considerações de UI/Componentes (Frontend)

Páginas sugeridas (App Router):

- `app/books/page.tsx` -> Lista + botão criar
- `app/books/new/page.tsx` -> Formulário de criação
- `app/books/[id]/page.tsx` -> Visualizar/Editar
- `app/members/...` -> similar
- `app/loans/page.tsx` -> Listagem de empréstimos, filtros (ativos, atrasados)

Componentes reutilizáveis
- `components/Filters.tsx`
- `components/BookCard.tsx`
- `components/MemberForm.tsx`
- `components/LoanForm.tsx`

Arquitetura de estilos
- Use CSS Modules ou SCSS global (`src/app/globals.css` já existe no template).
- Crie um `src/styles` para variáveis, mixins e componentes.

Acessibilidade e usabilidade
- Formulários com labels, validações e mensagens de erro claras.
- Feedback visual em operações de escrita (loading, sucesso, erro).

---

## Plano de testes (mínimo recomendado)

- Testes unitários para validadores e helpers.
- Testes de integração para rotas API usando `supertest` + in-memory Mongo (mongodb-memory-server) ou um banco de teste.

Casos de teste essenciais:
1. Criar Book (happy path) -> 201 + livro persistido
2. Criar Member -> 201
3. Criar Loan quando Book disponível -> 201 + Book.status = 'Emprestado'
4. Criar Loan quando Book já emprestado -> 400 (prevenir duplicata)
5. Devolver Loan -> returnDate setado + Book.status = 'Disponível'
6. Endpoint /api/loans?overdue=true retorna apenas atrasados

---

## Segurança e governança

- Proteção de rotas de escrita: rotas POST/PUT/DELETE devem requerer autenticação (bibliotecário). JWT + middleware é sugerido.
- Validação de entrada: usar `zod` ou `yup` para validar os corpos das requisições.
- Sanitização: evitar injeção ao exibir dados; usar escape onde necessário.
- Proteção contra remoção acidental: impedir exclusão de livros com Loan ativo.

---

## Riscos e mitigação (análise rápida)

1. Risco: Dados inconsistentes (emprestar livro já emprestado)
   - Mitigação: checagem atômica e validação antes de criar Loan; se possível usar transação (MongoDB Replica Set/Atlas) para criar Loan + atualizar Book em uma operação atômica.
2. Risco: Falta de autenticação (uso indevido)
   - Mitigação: ao menos proteger rotas de escrita com JWT e senha forte; para MVP, pode ser usuário único (bibliotecário) configurado via env.
3. Risco: Falta de backup
   - Mitigação: instruir uso de backup do MongoDB (Atlas ou dumps regulares).

---

## Roteiro de implementação (sprint curto)

Sequência prática para construir o MVP em ordem de dependência:

1. Configuração do DB: criar utilitário `src/lib/mongodb.ts` para conexão reutilizável.
2. Criar modelos Mongoose: `Book`, `Member`, `Loan`.
3. Implementar rotas API básicas para Books e Members (GET/POST/PUT/DELETE).
4. Implementar rotas de Loans (criar empréstimo com checagem, registrar devolução).
5. Frontend básico: páginas de listagem e formulários para Books e Members.
6. Página de Empréstimos e Atrasados.
7. Testes automatizados mínimos.
8. Polishing: validações, mensagens, pequenos estilos.

Tempo estimado: 2-4 dias de trabalho dependendo do nível de detalhe visual e testes.

---

## Scripts úteis / seed

Sugerir um script `scripts/seed.ts` (ou endpoint protegido) para popular dados iniciais para demonstração.

Exemplo de seed (conceito): criar 5 livros, 3 membros, 2 empréstimos (um atrasado).

---

## Integração contínua / Deploy

- CI recomendado: GitHub Actions com passos: install, build, test.
- Deploy: Vercel (Next.js) + MongoDB Atlas. Para segredos, usar Vercel Environment Variables.

Checklist de deploy
- `MONGODB_URI` configurada
- `JWT_SECRET` configurado
- Build nacional otimizado (`npm run build`)

---

## Métricas e relatórios simples (opcional)

Relatórios que podem agregar valor:
- Número de empréstimos por mês
- Percentual de devoluções em atraso
- Top 10 livros mais emprestados

Esses relatórios podem ser implementados como endpoints agregados (MongoDB Aggregation Framework).

---

## Guia rápido de desenvolvimento local

1. Clone o repositório
2. `npm install`
3. `cp .env.example .env.local` (ou criar `.env.local` manualmente)
4. Definir `MONGODB_URI` e `JWT_SECRET` (ou usar uma instância local)
5. `npm run dev`
6. Abrir `http://localhost:3000`

Blocos de comando (PowerShell):

```powershell
npm install
# criar .env.local com as variáveis mínimas
npm run dev
```

---

## Critérios de aceitação para entrega

- O professor/testador consegue:
  - Criar um livro e vê-lo na listagem.
  - Criar um membro.
  - Registrar um empréstimo e ver o status do livro alterado para "Emprestado".
  - Registrar a devolução e ver status voltar para "Disponível".
  - Acessar a página de empréstimos atrasados e visualizar casos com dueDate expirado.

---

## Checklist de apresentação (demo)

- [ ] Criar pelo menos 3 livros
- [ ] Criar 2 membros
- [ ] Registrar 2 empréstimos (um vencido)
- [ ] Demonstrar a listagem de atrasados
- [ ] Explicar a modelagem e como a integridade do status do livro é garantida

---

## Próximos passos (posso implementar agora)

Posso começar pela criação dos seguintes arquivos nesta ordem:

1. `src/lib/mongodb.ts` – utilitário de conexão com MongoDB (reutilizável em API routes e scripts).
2. `src/models/Book.ts` – modelo Mongoose para livros.
3. `src/models/Member.ts` – modelo Mongoose para membros.
4. `src/models/Loan.ts` – modelo Mongoose para empréstimos.
5. Rotas API: `src/app/api/books/route.ts`, `src/app/api/members/route.ts`, `src/app/api/loans/route.ts` (App Router).
6. Páginas frontend básicas em `app/books`, `app/members`, `app/loans`.

Se preferir, começo criando apenas os modelos e as rotas básicas de Books para você revisar. O que prefere que eu faça primeiro?

---

## Anexos técnicos (boas práticas rápidas)

- Use `try/catch` em handlers de API e retornar status HTTP apropriados (400, 404, 500).
- Centralizar mensagens de erro e validações para melhorar manutenção.
- Para operações que alteram múltiplos documentos (criar Loan + atualizar Book), considere transação ou checagem dupla seguido de rollback lógico em caso de falha.
- Evite expor `_id` sensíveis em logs públicos; usar `memberId` legível para integração com papelaria/local.

---

Obrigado — se desejar, prossigo e implemento os modelos Mongoose primeiro (arquivos e testes mínimos). Indique qual etapa iniciar e eu começo a aplicar as alterações no código fonte do projeto.
