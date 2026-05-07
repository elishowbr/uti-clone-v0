# 📊 Relatório de Testes - UTI Care v0

## 🎯 Status Atual (Nível 1 — Unitários)

```
Test Suites: 7 failed, 2 passed, 9 total
Tests:       22 failed, 112 passed, 134 total
Cobertura:
  - Statements: 40.14% (493/1228)
  - Branches:   41.13% (262/637)
  - Functions:  21.4% (76/355)
  - Lines:      41.29% (420/1017)
```

---

## ✅ Nível 2 — Testes de Integração (07/05/2026)

### Resumo Executivo

```
Test Suites: 3 passed, 3 total
Tests:       64 passed, 64 total
Snapshots:   0 total
Tempo:       ~2.3 s
Estratégia:  Prisma mockado via jest-mock-extended (mockDeep) — sem conexão real ao banco
```

### Correções Aplicadas Antes da Execução

| Arquivo | Problema | Correção |
|---------|----------|----------|
| `app/actions/saveEvolution.ts` | Identificador inválido `wwwwwwwwwwwwwwwwwww` na linha 30 | Removido |
| `scripts/Bedmanagement.integration.test .ts` | Espaço no nome do arquivo impedia detecção pelo Jest | Arquivo renomeado para `Bedmanagement.integration.test.ts` |

---

### 📁 Bedmanagement.integration.test.ts — 23/23 ✅

**Arquivo testado:** `app/actions/bedManagement.ts`

| Suite | Teste | Status |
|-------|-------|--------|
| `getDashboardData` | retorna lista de leitos com paciente e última evolução | ✅ |
| `getDashboardData` | retorna array vazio quando não há leitos | ✅ |
| `createBed` | cria leito com sucesso quando número não existe | ✅ |
| `createBed` | retorna erro quando número de leito já existe | ✅ |
| `createBed` | formata label corretamente para leito com número < 10 | ✅ |
| `createBed` | formata label corretamente para leito com número >= 10 | ✅ |
| `createBed` | retorna erro quando Prisma lança exceção | ✅ |
| `admitPatient` | admite paciente com sucesso via transação | ✅ |
| `admitPatient` | retorna erro quando a transação falha | ✅ |
| `admitPatient` | cria paciente com admission_date definida | ✅ |
| `dischargePatient` | dá alta ao paciente e envia leito para limpeza | ✅ |
| `dischargePatient` | retorna erro quando leito não é encontrado | ✅ |
| `dischargePatient` | processa alta mesmo quando leito não tem paciente vinculado | ✅ |
| `dischargePatient` | define discharge_date ao dar alta | ✅ |
| `finishCleaning` | muda status do leito para VACANT | ✅ |
| `finishCleaning` | retorna erro quando Prisma falha | ✅ |
| `setBedToCleaning` | envia leito para limpeza e limpa current_patient_id | ✅ |
| `setBedToCleaning` | retorna erro quando Prisma falha | ✅ |
| `deleteBed` | deleta leito vago com sucesso | ✅ |
| `deleteBed` | bloqueia deleção de leito OCUPADO | ✅ |
| `deleteBed` | retorna erro quando leito não existe | ✅ |
| `deleteBed` | retorna erro quando deleção falha por FK (histórico clínico) | ✅ |
| `deleteBed` | permite deletar leito em limpeza | ✅ |

---

### 📁 Patientdata.integration.test.ts — 21/21 ✅

**Arquivo testado:** `app/actions/patientData.ts`

| Suite | Teste | Status |
|-------|-------|--------|
| `getBedDetails` | retorna detalhes do leito com paciente e evoluções | ✅ |
| `getBedDetails` | retorna null quando leito não existe | ✅ |
| `getBedDetails` | retorna null quando Prisma lança erro | ✅ |
| `getBedDetails` | busca com include correto para evoluções ordenadas desc | ✅ |
| `getPatientFromBed` | retorna paciente e label do leito quando leito está ocupado | ✅ |
| `getPatientFromBed` | retorna fallback de label quando leito não tem label definida | ✅ |
| `getPatientFromBed` | retorna erro quando leito está vazio | ✅ |
| `getPatientFromBed` | retorna erro quando leito não existe no banco | ✅ |
| `getPatientFromBed` | retorna erro de conexão quando Prisma lança exceção | ✅ |
| `getLastEvolution` | retorna a evolução mais recente do paciente | ✅ |
| `getLastEvolution` | retorna null quando paciente não tem evoluções | ✅ |
| `getLastEvolution` | retorna null quando Prisma lança erro | ✅ |
| `savePatientData` | salva dados do paciente com sucesso | ✅ |
| `savePatientData` | converte height para Number no update | ✅ |
| `savePatientData` | salva height como null quando não informado | ✅ |
| `savePatientData` | converte birth_date para Date no update | ✅ |
| `savePatientData` | salva birth_date como null quando não informado | ✅ |
| `savePatientData` | retorna erro quando leito não existe | ✅ |
| `savePatientData` | retorna erro quando leito está vazio (sem current_patient_id) | ✅ |
| `savePatientData` | retorna erro quando update do Prisma falha | ✅ |
| `savePatientData` | retorna o paciente atualizado no resultado | ✅ |

---

### 📁 Saveevolution.integration.test.ts — 20/20 ✅

**Arquivo testado:** `app/actions/saveEvolution.ts`

| Suite | Teste | Status |
|-------|-------|--------|
| `saveEvolution` | salva evolução com sucesso e retorna `{ success: true }` | ✅ |
| `saveEvolution` | mapeia campos gerais (height, weight) corretamente | ✅ |
| `saveEvolution` | mapeia campos respiratórios corretamente | ✅ |
| `saveEvolution` | mapeia campos neurológicos corretamente | ✅ |
| `saveEvolution` | mapeia campos hemodinâmicos corretamente | ✅ |
| `saveEvolution` | mapeia campos renais corretamente | ✅ |
| `saveEvolution` | mapeia campos hematoinfecciosos corretamente | ✅ |
| `saveEvolution` | mapeia profilaxias corretamente | ✅ |
| `saveEvolution` | usa `generatedText` do formData quando informado | ✅ |
| `saveEvolution` | chama `generateEvolutionText` quando `generatedText` está vazio | ✅ |
| `saveEvolution` | concatena suportes nutricionais com vírgula | ✅ |
| `saveEvolution` | salva evacuação com data e aspecto concatenados | ✅ |
| `saveEvolution` | salva apenas aspecto da evacuação quando data não informada | ✅ |
| `saveEvolution` | atualiza peso do paciente quando weight informado | ✅ |
| `saveEvolution` | não atualiza peso do paciente quando weight está vazio | ✅ |
| `saveEvolution` | passa `bed_id` e `patient_id` corretos para o create | ✅ |
| `saveEvolution` | usa `HARDCODED_DOCTOR_ID = 1` no create | ✅ |
| `saveEvolution` | retorna `{ success: false, error }` quando create falha | ✅ |
| `saveEvolution` | trata height inválido (NaN) como null | ✅ |
| `saveEvolution` | `nutrition_surgical` é salvo como Boolean | ✅ |

---

### 🎯 Meta de Cobertura — Nível 2

| Fase | Meta | Status |
|------|------|--------|
| Nível 2 (Integração) | 70-80% das interações Actions → Prisma | ✅ Atingido (64/64 testes) |

### 🔍 Observações Técnicas

- Os `console.error` exibidos no output são **esperados**: são disparados pelos casos de teste que simulam falhas de banco (Connection error, Timeout, Constraint error, FK violation). Todos esses caminhos de erro foram validados corretamente.
- Os `console.log` em branco em `saveEvolution.ts:33` referem-se ao log de `data.generatedText` que está vazio em boa parte dos cenários de teste. Pode ser removido em produção.
- O `HARDCODED_DOCTOR_ID = 1` foi validado como comportamento intencional (TODO já registrado no código para futura integração com Auth).

---

## 📋 Comandos Disponíveis para Relatórios

### 1️⃣ Relatório Rápido (Terminal)
```bash
npm test
```
✅ **Mostra em tempo real** qual teste passou/falhou

### 2️⃣ Relatório com Cobertura (Terminal)
```bash
npm test:coverage
```
📊 **Gera:**
- Resumo em texto no terminal
- Arquivo JSON: `coverage/coverage-final.json`
- Página HTML interativa: `coverage/index.html`

### 3️⃣ Relatório Resumido
```bash
npm run test:report
```
📈 **Resultado:**
- Resumo visual no terminal
- Abre página HTML: `coverage/index.html`

### 4️⃣ Relatório em JSON (Para análises)
```bash
npm run test:json
```
```json
coverage/coverage-final.json
```

### 5️⃣ Modo Watch (Desenvolvimento)
```bash
npm test:watch
```
🔄 **Monitora** mudanças em tempo real

---

## 🗂️ Arquivos Gerados

Após rodar `npm test:coverage`, você terá:

```
coverage/
├── index.html           ← 🌐 ABRA AQUI NO NAVEGADOR
├── coverage-final.json  ← Dados em JSON
├── lcov-report/
└── ...outros arquivos
```

### 📂 Como Abrir o Relatório HTML

**Windows:**
```powershell
Start-Process coverage\index.html
```

**Mac/Linux:**
```bash
open coverage/index.html
```

**Via Terminal (qualquer OS):**
```bash
npm test:coverage
```

---

## 📊 Interpretando o Relatório HTML

### ✨ Informações Disponíveis:

| Métrica | Descrição | Ideal |
|---------|-----------|-------|
| **Statements** | Porcentagem de linhas de código testadas | >80% |
| **Branches** | Condições (if/else) testadas | >80% |
| **Functions** | Funções com testes | >80% |
| **Lines** | Linhas de código testadas | >80% |

### 🎨 Cores do Relatório:
- 🟢 **Verde**: >80% - Excelente
- 🟡 **Amarelo**: 50-79% - Bom
- 🔴 **Vermelho**: <50% - Precisa melhorar

---

## 🔍 Testes Falhando Atualmente

### ❌ HemodynamicsForm.test.tsx (6 falhas)
- Problema: Labels sem `for` attribute ou `aria-labelledby`
- Solução: Corrigir componente para ter inputs com labels associadas corretamente

### ❌ HematoinfectiousForm.test.tsx (3 falhas)
- Similar ao anterior - inputs sem associação com labels

### ❌ NeurologicalForm.test.tsx (5 falhas)
- Mesmo padrão de problema

### ❌ NutritionForm.test.tsx (3 falhas)
- Mesmo padrão de problema

### ❌ ProphylaxisForm.test.tsx (5 falhas)
- Mesmo padrão de problema

### ✅ Testes Passando
- `calculateAge.test.ts`: 10/10 ✓
- `generateEvolutionText.test.ts`: 102/102 ✓

---

## 🚀 Próximos Passos

### Usando o Relatório para Melhorias:

1. **Rode o relatório HTML:**
   ```bash
   npm run test:report
   ```

2. **Clique em arquivos com baixa cobertura** no HTML

3. **Veja o código** e identifique:
   - ✗ Linhas não cobertas (vermelhas)
   - ⚠️ Branches não testadas

4. **Adicione testes** para essas linhas

5. **Rode novamente** para ver progresso

---

## 💡 Dicas Importantes

### Para Aumentar Cobertura:
```bash
# Rode com watch mode e vá atualizando testes conforme escreve
npm test:watch
```

### Para Focar em Um Arquivo:
```bash
npm test -- scripts/calculateAge.test.ts
```

### Para Ver Qual Teste Falhou:
```bash
npm test -- --verbose
```

### Para Rodar Testes em Paralelo (mais rápido):
```bash
npm test -- --maxWorkers=4
```

---

## 📈 Histórico de Cobertura

| Fase | Meta | Status |
|------|------|--------|
| Phase 1 — Nível 1 Unitários (31/03/2026) | >40% | ✅ Atingido |
| Phase 2 — Nível 2 Integração (07/05/2026) | 70-80% Actions → Prisma | ✅ 64/64 testes passando |
| Phase 3 — Nível 1 + Cobertura 60% (Sprint) | >60% cobertura global | ⏳ Em progresso |
| Phase 4 (Produção) | >80% cobertura global | 📅 Planejado |

---

## 📞 Suporte Rápido

**Erro: "Cannot find module"?**
```bash
npm install --legacy-peer-deps
```

**Jest não encontra arquivo?**
```bash
npm test -- --listTests
```

**Limpar cache de testes?**
```bash
npm test -- --clearCache
```

---

**Última atualização:** 07/05/2026 — Nível 2 (Integração) concluído: 64/64 testes passando  
**Node.js:** 22.22.2  
**Jest:** 29.7.0
