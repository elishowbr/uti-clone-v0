# 📊 Relatório de Testes - UTI Care v0

## 🎯 Status Atual

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

Para adicionar tracking de cobertura ao Git:

```bash
# No .gitignore, JÁ ESTÁ CONFIGURADO:
coverage/
.nyc_output/
```

---

## 🎯 Meta de Cobertura

| Fase | Meta | Status |
|------|------|--------|
| Phase 1 (Atual) | >40% | ✅ Atingido |
| Phase 2 (Sprint) | >60% | ⏳ Em progresso |
| Phase 3 (Produção) | >80% | 📅 Planejado |

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

**Última atualização:** 31/03/2026  
**Node.js:** 22.22.2  
**Jest:** 29.7.0
