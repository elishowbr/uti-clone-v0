# 🏥 Relatório Técnico — Sistema de Login Multi-Papel

**Projeto:** UTI Care  
**Feature:** `feature/login-multi-role`  
**Data:** 14/05/2026  
**Tipo:** Pull Request — Sistema de Autenticação

---

## 📋 Sumário Executivo

Foi implementado um sistema de autenticação completo e responsivo, expandindo a tela de login de **2 para 4 perfis de acesso** (Médico, Enfermeiro, Administrador e Gestor), com nova tela de registro baseada no Figma, controle de acesso por papel (RBAC) no middleware e UI premium com split-screen.

---

## 🎬 Demonstração em Vídeo

> O vídeo abaixo demonstra o fluxo completo: seleção de papéis, login, RBAC e tela de registro.

![Demonstração do sistema de login](docs/assets/demo-login.webp)

---

## 📁 Arquivos Modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `lib/mockUsers.ts` | ✏️ MODIFY | +2 papéis: `ADMIN`, `MANAGER`. +2 usuários mock. Campo `unit` adicionado. |
| `app/actions/mockAuth.ts` | ✏️ MODIFY | `ROLE_REDIRECT` atualizado para `ADMIN` e `MANAGER`. |
| `middleware.ts` | ✏️ MODIFY | RBAC completo: isolamento de rotas por papel + suporte a `/register`. |
| `app/login/page.tsx` | ✏️ MODIFY | Redesign completo: split-screen, seletor 2×2, toggle de senha, credenciais dinâmicas. |
| `app/register/page.tsx` | 🆕 NEW | Nova tela de registro baseada no Figma, com validação client-side. |
| `docs/assets/` | 🆕 NEW | Assets de documentação (vídeo + screenshots). |

---

## 🔐 Papéis de Acesso (RBAC)

### Mapa de permissões

```
StaffRole = "DOCTOR" | "NURSE" | "ADMIN" | "MANAGER"
```

| Papel | Cor | Usuário Mock | Rota Home | Acesso Permitido |
|---|---|---|---|---|
| 🩺 DOCTOR | Azul | medica@hospital.com.br | `/admin` | `/admin` |
| 💉 NURSE | Esmeralda | enfermeiro@hospital.com.br | `/dashboard` | `/dashboard` |
| 🛡️ ADMIN | Índigo | admin@hospital.com.br | `/admin` | `/admin`, `/dashboard` |
| 📊 MANAGER | Âmbar | gestor@hospital.com.br | `/admin` | `/admin`, `/dashboard` |

### Lógica do Middleware

```typescript
// middleware.ts — RBAC por papel
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
    DOCTOR:  ["/admin"],
    NURSE:   ["/dashboard"],
    ADMIN:   ["/admin", "/dashboard"],
    MANAGER: ["/admin", "/dashboard"],
};
```

**Três camadas de proteção implementadas:**
1. 🔒 Não autenticados → redirecionados para `/login`
2. 🏠 Autenticados em `/login` ou `/register` → redirecionados para seu painel
3. 🚫 Papel errado tentando acessar rota proibida → redirecionado para home do papel

---

## 🎨 Tela de Login

### Layout Split-Screen Responsivo

| Breakpoint | Layout |
|---|---|
| Mobile (`< 1024px`) | Formulário centralizado, logo inline no topo |
| Desktop (`≥ 1024px`) | Painel de branding azul à esquerda + formulário à direita |

### Seletor de Papel (Grid 2×2)

Cada papel tem identidade visual própria (ícone + cor + descrição):

- **Médico** → `Stethoscope` 🔵 Azul
- **Enfermeiro** → `HeartPulse` 🟢 Esmeralda
- **Administrador** → `ShieldCheck` 🟣 Índigo
- **Gestor** → `TrendingUp` 🟡 Âmbar

---

## 🧾 Credenciais de Demonstração

| Papel | E-mail | Senha |
|---|---|---|
| Médico | `medica@hospital.com.br` | `Medico@2026` |
| Enfermeiro | `enfermeiro@hospital.com.br` | `Enfermeiro@2026` |
| Administrador | `admin@hospital.com.br` | `Admin@2026` |
| Gestor | `gestor@hospital.com.br` | `Gestor@2026` |

> ⚠️ Estas credenciais existem apenas no protótipo mock. Não há banco de dados envolvido.

---

## 📝 Tela de Registro

### Screenshot

![Tela de registro](docs/assets/screenshot-register.png)

### Validações Client-Side

- ✅ Campos obrigatórios
- ✅ Formato de e-mail válido
- ✅ Senha mínima de 8 caracteres
- ✅ Confirmação de senha deve coincidir
- ✅ Aceite dos termos obrigatório

> 🚧 **Backend de registro não implementado** — O schema Prisma atual não vincula `User ↔ Doctor/Nurse`. O formulário exibe tela de "em desenvolvimento" ao submeter.

---

## 🧪 Roteiro de Testes (11 casos)

### Configuração

```bash
npm install
npm run dev
# Acesse: http://localhost:3000
```

---

### ✅ Caso 1 — Tela de Login carrega corretamente

1. Acesse `http://localhost:3000/login`
2. **Desktop:** Verifique o layout split-screen (painel azul + formulário)
3. **Mobile:** Redimensione para 375px — painel azul some, logo aparece inline
4. **Esperado:** Layout correto nos dois breakpoints

---

### ✅ Caso 2 — Seletor de papéis

1. Clique em cada um dos 4 papéis
2. **Esperado:**
   - Cor de borda e fundo do card muda
   - Credenciais na caixa de demo se atualizam
   - Placeholder do e-mail muda

---

### ✅ Caso 3 — Login como Médico

| Campo | Valor |
|---|---|
| Papel | Médico |
| E-mail | `medica@hospital.com.br` |
| Senha | `Medico@2026` |

**Esperado:** Redirect para `/admin`

---

### ✅ Caso 4 — Login como Enfermeiro

| Campo | Valor |
|---|---|
| Papel | Enfermeiro |
| E-mail | `enfermeiro@hospital.com.br` |
| Senha | `Enfermeiro@2026` |

**Esperado:** Redirect para `/dashboard`

---

### ✅ Caso 5 — Login como Administrador

| Campo | Valor |
|---|---|
| Papel | Administrador |
| E-mail | `admin@hospital.com.br` |
| Senha | `Admin@2026` |

**Esperado:** Redirect para `/admin`

---

### ✅ Caso 6 — Login como Gestor

| Campo | Valor |
|---|---|
| Papel | Gestor |
| E-mail | `gestor@hospital.com.br` |
| Senha | `Gestor@2026` |

**Esperado:** Redirect para `/admin`

---

### ✅ Caso 7 — Credenciais inválidas

1. Insira qualquer e-mail e senha incorretos
2. Clique em "Entrar no sistema"
3. **Esperado:** Mensagem de erro `"Credenciais inválidas. Verifique e-mail e senha."`

---

### ✅ Caso 8 — RBAC: Bloqueio de rota

1. Faça login como **Enfermeiro** (vai para `/dashboard`)
2. Tente acessar `http://localhost:3000/admin` manualmente
3. **Esperado:** Redirecionamento automático de volta para `/dashboard`

---

### ✅ Caso 9 — Proteção de rota sem autenticação

1. Abra aba anônima (sem cookies)
2. Acesse `http://localhost:3000/admin` ou `/dashboard`
3. **Esperado:** Redirect para `/login`

---

### ✅ Caso 10 — Tela de registro com validação

1. Acesse `http://localhost:3000/register`
2. Clique em "Acessar Conta" com campos vazios
3. **Esperado:** Erros inline por campo
4. Insira senhas diferentes nos campos de senha
5. **Esperado:** Erro "As senhas não coincidem" no 2º campo
6. Preencha tudo corretamente + aceite termos + clique em "Acessar Conta"
7. **Esperado:** Tela de sucesso com aviso "em desenvolvimento"

---

### ✅ Caso 11 — Usuário autenticado tenta acessar /login

1. Faça login com qualquer credencial
2. Tente acessar `http://localhost:3000/login`
3. **Esperado:** Redirect para o painel do papel logado

---

## 🏗️ Decisões Técnicas

### Por que manter autenticação mock?

O schema Prisma modela `Doctor` com `user_id: String` mas sem a tabela `User` completa com hash de senha. Adicionar autenticação real exigiria migrations no banco — fora do escopo desta PR. A camada mock permite validar o fluxo completo de UI.

### Por que `ADMIN` e `MANAGER` vão para `/admin`?

O projeto ainda não tem rotas separadas. Ambos utilizam o painel médico como base — diferenciação de sidebar será implementada em próxima sprint.

### Por que a tela de registro não salva?

Exigiria: (1) modelar `User ↔ Doctor/Nurse` no Prisma, (2) bcrypt da senha, (3) server action de registro — escopo futuro.

---

## ✅ Checklist para PR

- [x] Sem `console.log` de debug
- [x] Tipos TypeScript explícitos em todos os componentes
- [x] Acessibilidade: `aria-pressed`, `aria-invalid`, `aria-describedby`, `aria-label`, `role="alert"`
- [x] IDs únicos em inputs e botões (`login-email`, `login-submit`, `register-fullname`, etc.)
- [x] Responsividade: mobile 375px, tablet 768px, desktop 1280px
- [x] RBAC implementado e testado no middleware
- [x] Credenciais de demo corretas por papel
- [x] Nenhuma quebra em `/dashboard`, `/admin`, `/logout`
- [x] Sem alterações no schema Prisma (sem migrations)
- [x] **Sem novas dependências no `package.json`**

---

*Gerado por: UTI Care Dev Team · © 2026*
