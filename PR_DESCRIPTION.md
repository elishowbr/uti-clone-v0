## Resumo

Implementação do campo **Categoria de Usuário** (`role`) no model `User` do Prisma, habilitando o sistema RBAC (Role-Based Access Control) de ponta a ponta — do banco de dados até o middleware de roteamento.

### Antes
O model `User` no banco possuía apenas `name`, `email` e `password`. O controle de acesso por role funcionava **exclusivamente via mock** (`lib/mockUsers.ts` + `actions/mockAuth.ts`), enquanto o login real (`auth.ts`) sempre redirecionava para `/dashboard` sem distinção de perfil.

### Depois
O `User` agora possui um campo `role` persistido no banco com o enum `StaffRole` (`DOCTOR`, `NURSE`, `ADMIN`, `MANAGER`). O login real salva o role no JWT da sessão, o middleware RBAC funciona end-to-end, e o registro de novos usuários inclui seleção de categoria.

---

## Arquivos Modificados

| # | Mudança | Arquivo |
|---|---|---|
| 1 | Enum `StaffRole` + campo `role` no model `User` | `prisma/schema.prisma` |
| 2 | Import de `StaffRole` migrado para Prisma Client | `lib/session.ts` |
| 3 | Login real agora salva role no JWT + redireciona por categoria | `app/actions/auth.ts` |
| 4 | **Novo** server action de registro com validação completa | `app/actions/register.ts` |
| 5 | Página de registro com seletor de categoria (grid 2x2) | `app/register/page.tsx` |
| 6 | Seed com 4 usuários de demonstração (um por role) | `prisma/seed.ts` |

---

## Detalhes Técnicos

### Schema Prisma
```diff
+enum StaffRole {
+  DOCTOR
+  NURSE
+  ADMIN
+  MANAGER
+}

 model User {
   ...
+  role       StaffRole @default(NURSE)
   ...
 }
```

### Login (`auth.ts`)
- `createSession(id)` → `createSession(id, user.role)` 
- Redirect fixo `/dashboard` → redirect dinâmico por role (`DOCTOR`→`/admin`, `NURSE`→`/dashboard`, etc.)

### Registro (`register.ts` — NOVO)
- Server action com validação server-side completa
- Hash bcrypt (custo 10)
- Verificação de email duplicado
- Validação de role contra enum

### Seed
4 usuários de demo criados (senha padrão: `123456`):

| Email | Role |
|---|---|
| `admin@hospital.com.br` | ADMIN |
| `medica@hospital.com.br` | DOCTOR |
| `enfermeiro@hospital.com.br` | NURSE |
| `gestor@hospital.com.br` | MANAGER |

---

## Migração Necessária

Após merge, rodar:
```bash
npx prisma migrate dev --name add_user_role
npx prisma db seed
```

> Usuários existentes receberão `role = NURSE` (default mais restritivo).

---

## Validação

| Verificação | Status |
|---|---|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma generate` | ✅ Client gerado com enum StaffRole |
| `npx tsc --noEmit` (arquivos modificados) | ✅ Zero erros |
