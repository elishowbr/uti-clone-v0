# Relatório Técnico de Desenvolvimento & Planejamento de MVP — UTI Care

Este relatório apresenta um mapeamento detalhado do estado atual do projeto **UTI Care**, detalhando todas as conquistas de arquitetura e segurança implementadas até o momento e estabelecendo um plano de ação claro (Roadmap) com as funcionalidades pendentes para transformar o sistema em um MVP (Produto Mínimo Viável) 100% funcional, seguro e pronto para comercialização/homologação hospitalar.

---

## 🚀 1. O Que Foi Realizado (Entregue com Sucesso)

O projeto passou por uma profunda evolução de engenharia de software, deixando de ser um protótipo com dados estáticos para se tornar um sistema dinâmico de arquitetura Next.js (App Router) integrado a um banco de dados relacional real:

### A. Infraestrutura de Conexão & Banco de Dados (Supabase + Prisma)
* **Configuração da Conexão Direta (`prisma.config.ts`):** Superada a limitação do Next.js CLI em carregar dinamicamente as variáveis do `.env` na build inicial, configurando de forma estática e estável a porta `5432` da `DIRECT_URL` para operações administrativas e migrações.
* **Sincronização de Tabelas (`npx prisma db push`):** Banco de dados relacional PostgreSQL do Supabase 100% estruturado, refletindo o schema de leitos, pacientes, médicos, evolução clínica e usuários.
* **PrismaClient Singleton com PostgreSQL Adapter:** Inicialização eficiente do cliente em `/lib/prisma.ts` usando `@prisma/adapter-pg` e `pg` Pool de transações (`port 6543` com `pgbouncer=true`), garantindo estabilidade contra estouro de conexões em ambientes Serverless.
* **Ajuste de Sequences e Chaves Únicas no Seed:** Injeção de drivers PostgreSQL standalone no seed para executar comandos SQL nativos (`$executeRawUnsafe`), alinhando o autoincremento do PostgreSQL e evitando falhas de chave duplicada ao popular a UTI.

### B. Controle de Acesso Baseado em Regras (RBAC) & Segurança
* **Middleware Estrito de Segurança (`middleware.ts`):** 
  * O **Gestor (`MANAGER`)** tem acesso permitido **exclusivamente** às rotas de `/admin` (Gestão Estratégica), sendo estritamente bloqueado de entrar no `/dashboard` clínico.
  * O **Médico (`DOCTOR`)** e o **Enfermeiro (`NURSE`)** têm acesso permitido **exclusivamente** ao `/dashboard` clínico, sendo blindados contra a visualização de painéis financeiros ou estratégicos em `/admin`.
* **Login Corporativo de Alta Segurança (`app/login/page.tsx`):** Redesenhado em formato Split-screen premium. Removidos todos os seletores manuais de papel do formulário e links de cadastro público desnecessários em ambiente corporativo. A identificação do papel é resolvida de forma invisível pelo backend após a autenticação da Server Action.
* **Sessão baseada em JWT Assinado:** Implementação de tokens de sessão criptografados persistindo `role` e `userId`, prevenindo qualquer forma de sequestro de rotas ou ataques do tipo IDOR.

### C. Rebranding do Painel de Gestão Hospitalar (`/admin`)
O painel administrativo foi completamente reformulado para atender às necessidades estratégicas do **Gestor** (e não mais do médico, reduzindo ruídos de linguagem):
* **Sidebar Estruturada para Gestão:** Substituídos menus de prescrição e notas médicas por abas de governança (Auditoria de pacientes, status de leitos, auditoria de prontuários, controle de equipe e relatórios hospitalares).
* **Painel de Boas-Vindas Dinâmico:** Adaptação inteligente que substitui o campo de CRM médico por um badge institucional de "Nível de Acesso: Gestão Hospitalar" para usuários gestores.
* **Ações de Alta Gerência (`QuickActionsPanel.tsx`):** Atalhos práticos focados em girar leitos, analisar permanência média, gerenciar staff de profissionais e auditar faturamento.

### D. Componente de Perfil e Logout Unificado (`UserProfileDropdown`)
* Criação de um menu dropdown interativo e responsivo no canto superior direito de todos os painéis (clínico e gerencial), exibindo avatar em gradiente moderno, iniciais, nome real, cargo traduzido e botão de Logout instantâneo com limpeza total de cookies da sessão.

---

## 🎯 2. O Que Ainda Falta para o MVP 100% Funcional

Para que o UTI Care atinja conformidade total de homologação hospitalar e operacionalização comercial, o seguinte plano de ação (Roadmap) deve ser executado:

### 📍 Fase A: Completar as Telas de Auditoria e Gestão (Abas `/admin`)
Atualmente, as abas na barra lateral do painel de Gestão estão com o rótulo "Em breve" (`comingSoon: true`). É necessário desenvolver as seguintes interfaces e actions:
1. **Gestão da Equipe (`/admin/staff`):**
   * **Objetivo:** Tela para o Gestor visualizar médicos e enfermeiros ativos, cadastrar novos colaboradores no hospital (gerando a senha padrão cryptografada) e desativar acessos temporariamente.
   * **Implementação:** Criar formulário reativo acoplado a Server Actions de cadastro (`createUser` / `deleteUser`).
2. **Auditoria de Evoluções (`/admin/evolutions`):**
   * **Objetivo:** Permitir que a auditoria médica do hospital verifique se os médicos preencheram as evoluções clínicas regulamentares das últimas 24h de forma correta, garantindo compliance de faturamento.
   * **Implementação:** Listar pacientes ordenados por pendência de evolução com filtros de data.
3. **Indicadores & Gráficos Estratégicos (`/admin/indicators`):**
   * **Objetivo:** Trazer valor comercial ao produto exibindo relatórios visuais inteligentes.
   * **Implementação:** Integrar uma biblioteca como `Chart.js` ou `Recharts` para exibir gráficos de linha e rosca demonstrando:
     * Taxa de ocupação média mensal.
     * Média de dias de permanência dos pacientes em leito de UTI.
     * Percentual de altas vs óbitos por período de tempo.

### 📍 Fase B: Refinamentos Operacionais do Fluxo Clínico (`/dashboard`)
1. **Histórico Completo de Evoluções Clínicas:**
   * **Objetivo:** O médico ao acessar `/dashboard/[bedId]/evolution` atualmente consegue salvar uma nova evolução, mas não consegue ler as evoluções anteriores de outros médicos do plantão. É fundamental exibir uma linha do tempo (Timeline) abaixo do formulário de preenchimento mostrando o histórico das últimas condutas registradas para aquele paciente.
   * **Implementação:** Query Prisma buscando evoluções associadas ao `patient_id` ordenadas por `created_at desc`.
2. **Integração Física do Fluxo de Higienização de Leitos:**
   * **Objetivo:** No dashboard clínico, quando o paciente recebe alta, o status do leito entra automaticamente em `CLEANING` (Higienização). É crucial adicionar um botão visual rápido para o profissional de enfermagem finalizar a higienização (`finishCleaning`), fazendo com que o leito retorne imediatamente ao status de `VACANT` direto pelo grid, sem depender de banco.
   * **Implementação:** Desenvolver o botão no grid de leitos condicionado ao status `'CLEANING'`.
3. **Prescrições e Exames Simplificados:**
   * **Objetivo:** Médicos intensivistas necessitam registrar condutas medicamentosas urgentes (drogas vasoativas, sedativos).
   * **Implementação:** Adicionar formulário simplificado de prescrição clínica de suporte de vida ligando a tabela `Prescription` no Prisma.

---

## 🗺️ 3. Tabela Comparativa de Escopo (MVP vs Comercial Completo)

| Funcionalidade | Estado Atual | Classificação MVP | Esforço Estimado |
|---|---|---|---|
| **Login com RBAC Real** | ✅ Concluído (Supabase integrado) | Essencial | — |
| **Isolamento via Middleware** | ✅ Concluído (Médico vs Gestor) | Essencial | — |
| **Evolução Clínica Real** | ✅ Concluído (Associação automática de médico) | Essencial | — |
| **Dropdown "Meu Perfil"** | ✅ Concluído (Dropdown interativo unificado) | Diferencial UX | — |
| **Finalização de Higienização na UI** | ❌ Ação existe no backend, falta na UI | Altamente Crítico | 1 hora |
| **Linha do Tempo de Prontuário** | ❌ Backend estruturado, falta na UI do prontuário | Altamente Crítico | 2 cores |
| **Módulo de Cadastro de Equipe** | ❌ Parcial (Cadastro apenas via seed do banco) | Essencial | 3 horas |
| **Módulo de Auditoria de Evoluções** | ❌ Parcial (KPIs existem, falta listagem detalhada) | Desejável | 2 horas |
| **Painel de Gráficos de KPIs** | ❌ Parcial (Dados brutos em cards, falta charts) | Diferencial MVP | 4 horas |

---

## 🛠️ 4. Requisitos de Produção (Hardening)

Para submeter o código à esteira de CI/CD ou servidores Cloud reais (Ex: Vercel, AWS):
1. **Variáveis de Ambiente Estritamente Protegidas:** Retirar do arquivo `prisma.config.ts` em ambiente de produção a DIRECT_URL hardcoded, mapeando-a para ler `process.env.DIRECT_URL` e injetando as credenciais no segredo da nuvem.
2. **Monitoramento e Logs:** Integrar um middleware de logging simples (Ex: `pino-next` ou logs nativos nas Server Actions) para mapear acessos e tentativas de login maliciosas.
3. **Auditoria de Ações Clínicas:** Garantir que exclusão de leitos ou altas hospitalares fiquem salvas em uma tabela de auditoria física (Log de eventos) para compliance com a LGPD e conselhos regionais de medicina.
