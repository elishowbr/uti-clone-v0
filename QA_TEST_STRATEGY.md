# 🧪 Estratégia de Testes Abrangente - UTI Care v0

**Projeto**: Sistema de Gerenciamento de Pacientes em UTI (UTI Care v0)  
**Stack**: Next.js 16 + React 19 + TypeScript + Prisma ORM + PostgreSQL  
**Objetivo**: Garantir cobertura de código, confiabilidade de integração e resiliência em produção  
**Data**: 28/03/2026

---

## 📋 Sumário Executivo

Este documento define uma estratégia de testes em **7 níveis** para o sistema UTI Care:

| Nível | Escopo | Cobertura Esperada | Ferramentas |
|-------|--------|-------------------|-------------|
| **1. Unitários** | Componentes React, funções utilitárias, lógica de negócio | 80-90% | Jest, React Testing Library |
| **2. Integração** | Interação entre camadas (Components → Server Actions → Prisma → DB) | 70-80% | Jest + ts-node, Supertest |
| **3. Contrato** | Sincronismo Frontend/Backend e APIs internas | 100% | Pact.js |
| **4. E2E** | Fluxos críticos do usuário (Happy Path + Exceções) | Fluxos críticos | Playwright |
| **5. Performance** | Carga, stress, latência de resposta | SLA compliance | k6, Artillery |
| **6. Segurança** | OWASP Top 10, injeção SQL, XSS, autenticação | Critical issues = 0 | OWASP ZAP, npm audit |
| **7. Resiliência** | Comportamento com falhas de banco/serviços | Degradação controlada | Chaos toolkit, LocalStack |

---

## 🏗️ NÍVEL 1: TESTES UNITÁRIOS

### Objetivo
Testar lógica isolada de componentes React, funções utilitárias e cálculos de negócio.

### Estratégia
```
App Structure:
├── Components (React) → 80-90% coverage (branches)
├── Utils (TypeScript) → 100% coverage (crítico)
├── Server Actions → 90% coverage
├── Hooks customizados → 85% coverage
└── Selectors → 80% coverage
```

### Metas de Cobertura
- **Statement Coverage**: 80%+
- **Branch Coverage**: 75%+ ✅ (foco principal)
- **Line Coverage**: 85%+
- **Function Coverage**: 85%+

### Ferramentas & Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom \
  @types/jest jest-environment-jsdom @testing-library/user-event
```

### Exemplo 1: Teste Unitário - Componente React

**Arquivo**: `HematoinfectiousForm.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HematoinfectiousForm, { HematoinfectiousData } from './HematoinfectiousForm';

describe('HematoinfectiousForm Component', () => {
  const mockData: HematoinfectiousData = {
    antibiotics: [{ id: '1', name: 'Ceftriaxona', startDate: new Date('2026-03-20') }],
    cultures: [{ id: '1', material: 'Sangue', sensitivity: 'Sensível' }],
    temperature: '38.5',
    biomarkers: 'PCR: 8.5 mg/dL',
    corticoids: 'Dexametasona 10mg',
    observations: 'Monitorar febre'
  };

  const mockOnChange = jest.fn();

  it('should render form with initial data', () => {
    render(
      <HematoinfectiousForm data={mockData} onChange={mockOnChange} />
    );
    
    expect(screen.getByText(/Hematoinfeccioso/i)).toBeInTheDocument();
  });

  it('should handle expansion toggle', () => {
    render(
      <HematoinfectiousForm data={mockData} onChange={mockOnChange} />
    );
    
    const toggleButton = screen.getByRole('button', { name: /expandir|recolher/i });
    fireEvent.click(toggleButton);
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should calculate antibiotic days correctly', () => {
    render(
      <HematoinfectiousForm data={mockData} onChange={mockOnChange} />
    );
    
    // Assumindo que o componente exibe "Ceftriaxona (D8)"
    expect(screen.getByText(/Ceftriaxona \(D\d+\)/)).toBeInTheDocument();
  });

  it('should call onChange when antibiotic is added', async () => {
    const { getByRole } = render(
      <HematoinfectiousForm data={mockData} onChange={mockOnChange} />
    );
    
    // Simular clique para adicionar antibiótico
    const addButton = getByRole('button', { name: /adicionar antibiótico/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        'antibiotics',
        expect.any(Array)
      );
    });
  });

  it('should handle empty data gracefully', () => {
    const emptyData: HematoinfectiousData = {
      antibiotics: [],
      cultures: [],
      temperature: '',
      biomarkers: '',
      corticoids: '',
      observations: ''
    };
    
    render(
      <HematoinfectiousForm data={emptyData} onChange={mockOnChange} />
    );
    
    expect(screen.getByText(/Nenhum antibiótico|sem registros/i)).toBeInTheDocument();
  });

  it('should validate temperature input format', async () => {
    render(
      <HematoinfectiousForm data={mockData} onChange={mockOnChange} />
    );
    
    const tempInput = screen.getByLabelText(/Temperatura/i);
    await userEvent.clear(tempInput);
    await userEvent.type(tempInput, 'inválido');
    
    expect(screen.getByText(/Temperatura inválida/i)).toBeInTheDocument();
  });

  // Branch Coverage Tests
  describe('Format Helpers - Branch Coverage', () => {
    it('should format antibiotics with multiple drugs', () => {
      const multipleAbx = [
        { id: '1', name: 'Ceftriaxona', startDate: new Date('2026-03-20') },
        { id: '2', name: 'Vancomicina', startDate: new Date('2026-03-22') }
      ];
      
      render(
        <HematoinfectiousForm 
          data={{ ...mockData, antibiotics: multipleAbx }} 
          onChange={mockOnChange} 
        />
      );
      
      expect(screen.getByText(/Ceftriaxona.*Vancomicina/)).toBeInTheDocument();
    });

    it('should handle cultures with pending sensitivity', () => {
      const pendingCulture = [
        { id: '1', material: 'Urina', sensitivity: 'Pendente' }
      ];
      
      render(
        <HematoinfectiousForm 
          data={{ ...mockData, cultures: pendingCulture }} 
          onChange={mockOnChange} 
        />
      );
      
      expect(screen.getByText(/Urina.*Pendente/)).toBeInTheDocument();
    });
  });
});
```

### Exemplo 2: Teste Unitário - Função Utilitária

**Arquivo**: `calculateAge.test.tsx`

```typescript
import { calculateAge } from './calculateAge';

describe('calculateAge Utility', () => {
  it('should calculate age in years correctly', () => {
    const birthDate = new Date('1980-03-28');
    const referenceDate = new Date('2026-03-28');
    
    expect(calculateAge(birthDate, referenceDate)).toBe(46);
  });

  it('should handle leap year dates', () => {
    const birthDate = new Date('2000-02-29');
    const referenceDate = new Date('2026-03-28');
    
    expect(calculateAge(birthDate, referenceDate)).toBe(26);
  });

  it('should return 0 for current year births', () => {
    const birthDate = new Date('2026-01-15');
    const referenceDate = new Date('2026-03-28');
    
    expect(calculateAge(birthDate, referenceDate)).toBe(0);
  });

  it('should throw error for future birth date', () => {
    const birthDate = new Date('2027-03-28');
    const referenceDate = new Date('2026-03-28');
    
    expect(() => calculateAge(birthDate, referenceDate)).toThrow('Data de nascimento inválida');
  });
});
```

### Jest Configuration

**Arquivo**: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/app'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/index.ts',
    '!app/**/*.stories.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 80
    },
    './app/dashboard/**/*.tsx': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1'
  }
};
```

**Arquivo**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom';

// Mock de variáveis de ambiente
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
```

### Checklist Implementação Nível 1

- [ ] Jest e Testing Library instalados
- [ ] Configuração jest.config.js criada
- [ ] Testes para todos componentes de Form (HematoinfectiousForm, HemodynamicsForm, etc.)
- [ ] Testes para Selectors (AntibioticsSelector, CulturesSelector, etc.)
- [ ] Testes para funções utilitárias (calculateAge, generateEvolutionText, etc.)
- [ ] Testes para Server Actions (bedManagement.ts, patientData.ts, saveEvolution.ts)
- [ ] Coverage mínimo 80% alcançado
- [ ] CI/CD pipeline executa testes a cada commit

---

## 🔗 NÍVEL 2: TESTES DE INTEGRAÇÃO

### Objetivo
Validar a comunicação entre camadas: React Components → Server Actions → Prisma ORM → PostgreSQL

### Arquitetura de Teste

```
[ Front-end (React) ]
         ↓
[ Server Actions (app/actions/*.ts) ]
         ↓
[ Prisma Client ]
         ↓
[ PostgreSQL Database ]
```

### Estratégia
1. **Database Integration**: Usar banco de testes isolado
2. **Transaction Rollback**: Cada teste roda em transação que faz rollback
3. **Seed Data**: Dados conhecidos antes de cada teste

### Ferramentas

```bash
npm install --save-dev supertest jest-mock-extended @types/supertest testcontainers
npm install --save-dev postgresql # or use docker-compose
```

### Exemplo 1: Integração - Server Action com Banco

**Arquivo**: `app/actions/saveEvolution.ts` (código atual)

```typescript
// Código hipotético - a implementar
export async function saveEvolution(
  bedId: number,
  doctorId: string,
  evolutionData: EvolutionPayload
) {
  const patient = await prisma.patient.findUnique({
    where: { bed_id: bedId }
  });

  if (!patient) throw new Error('Patient not found');

  const evolution = await prisma.clinicalEvolution.create({
    data: {
      patient_id: patient.id,
      doctor_id: doctorId,
      hematoinfectious: evolutionData.hematoinfectious,
      hemodynamics: evolutionData.hemodynamics,
      neurological: evolutionData.neurological,
      created_at: new Date()
    }
  });

  return evolution;
}
```

**Arquivo**: `app/actions/__tests__/saveEvolution.integration.test.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { saveEvolution } from '../saveEvolution';

describe('saveEvolution - Integration Tests', () => {
  let prisma: PrismaClient;
  let testBedId: number;
  let testDoctorId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    
    // Setup: criar dados de teste
    const doctor = await prisma.doctor.create({
      data: {
        user_id: 'test-doctor-001',
        name: 'Dr. João Silva',
        crm: '12345/SP',
        position: 'Intensivista'
      }
    });
    testDoctorId = doctor.user_id;

    const bed = await prisma.bed.create({
      data: {
        bed_number: 'UTI-001',
        status: 'OCCUPIED'
      }
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'Maria Santos',
        age: 65,
        sex: 'FEMALE',
        bed_id: bed.id,
        admission_date: new Date()
      }
    });

    testBedId = bed.id;
  });

  afterAll(async () => {
    // Cleanup: deletar dados de teste
    await prisma.clinicalEvolution.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.bed.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.$disconnect();
  });

  it('should save evolution successfully with complete data', async () => {
    const evolutionData = {
      hematoinfectious: {
        antibiotics: [
          { name: 'Ceftriaxona', startDate: new Date('2026-03-20') }
        ],
        temperature: '38.5',
        biomarkers: 'PCR: 8.5'
      },
      hemodynamics: { bloodPressure: '140/90' },
      neurological: { score: 15 }
    };

    const result = await saveEvolution(testBedId, testDoctorId, evolutionData);

    expect(result).toBeDefined();
    expect(result.hematoinfectious).toEqual(evolutionData.hematoinfectious);

    // Verificar persistência no banco
    const saved = await prisma.clinicalEvolution.findUnique({
      where: { id: result.id }
    });

    expect(saved).toBeDefined();
    expect(saved?.hematoinfectious).toEqual(evolutionData.hematoinfectious);
  });

  it('should throw error when patient not found', async () => {
    const invalidBedId = 99999;

    await expect(
      saveEvolution(invalidBedId, testDoctorId, {})
    ).rejects.toThrow('Patient not found');
  });

  it('should update existing evolution correctly', async () => {
    const initialData = {
      hematoinfectious: { temperature: '38.0' },
      hemodynamics: {},
      neurological: {}
    };

    const first = await saveEvolution(testBedId, testDoctorId, initialData);
    expect(first.hematoinfectious.temperature).toBe('38.0');

    // Atualizar dados
    const updatedData = {
      hematoinfectious: { temperature: '36.5' },
      hemodynamics: {},
      neurological: {}
    };

    const updated = await saveEvolution(testBedId, testDoctorId, updatedData);
    expect(updated.hematoinfectious.temperature).toBe('36.5');
  });

  it('should handle concurrent saves correctly', async () => {
    const promises = Array.from({ length: 3 }).map((_, i) =>
      saveEvolution(testBedId, testDoctorId, {
        hematoinfectious: { temperature: String(37 + i * 0.1) },
        hemodynamics: {},
        neurological: {}
      })
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(3);
    
    const count = await prisma.clinicalEvolution.count({
      where: { doctor_id: testDoctorId }
    });
    
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
```

### Exemplo 2: Integração - Componente + Server Action

**Arquivo**: `app/dashboard/[bedId]/evolution/__tests__/EvolutionPage.integration.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EvolutionPage from '../page';
import * as evolutionActions from '@/app/actions/saveEvolution';

jest.mock('@/app/actions/saveEvolution');

describe('EvolutionPage - Component + Action Integration', () => {
  const mockBedId = '1';
  const mockDoctorId = 'doctor-001';

  beforeEach(() => {
    jest.clearAllMocks();
    (evolutionActions.saveEvolution as jest.Mock).mockResolvedValue({
      id: '1',
      bedId: mockBedId,
      createdAt: new Date()
    });
  });

  it('should load evolution page and display form', async () => {
    render(<EvolutionPage params={{ bedId: mockBedId }} />);

    await waitFor(() => {
      expect(screen.getByText(/Evolução Clínica/i)).toBeInTheDocument();
    });
  });

  it('should call saveEvolution when form is submitted', async () => {
    render(<EvolutionPage params={{ bedId: mockBedId }} />);

    const submitButton = screen.getByRole('button', { name: /salvar evolução/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(evolutionActions.saveEvolution).toHaveBeenCalledWith(
        mockBedId,
        mockDoctorId,
        expect.objectContaining({
          hematoinfectious: expect.any(Object)
        })
      );
    });
  });

  it('should show error message if save fails', async () => {
    (evolutionActions.saveEvolution as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    render(<EvolutionPage params={{ bedId: mockBedId }} />);

    const submitButton = screen.getByRole('button', { name: /salvar evolução/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erro ao salvar/i)).toBeInTheDocument();
    });
  });
});
```

### Database Testing Setup

**Arquivo**: `jest.setup.integration.js`

```javascript
const { PrismaClient } = require('@prisma/client');

// SQLite em memória para testes
process.env.DATABASE_URL = 'file:./test.db';

beforeAll(async () => {
  const prisma = new PrismaClient();
  await prisma.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS test_db');
});

afterAll(async () => {
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});
```

### Checklist Implementação Nível 2

- [ ] Testes de Server Actions (bedManagement, patientData, saveEvolution)
- [ ] Testes de Prisma queries (findUnique, findMany, create, update, delete)
- [ ] Setup de banco de dados de teste isolado
- [ ] Seed data scripts criados
- [ ] Testes de integridade referencial (foreign keys)
- [ ] Testes de validação de dados no banco
- [ ] Testes de transações e rollback
- [ ] Coverage integração 70%+

---

## 📋 NÍVEL 3: TESTES DE CONTRATO (Pact/Consumer-Driven)

### Objetivo
Garantir que Frontend e Backend "falam a mesma língua" - sincronismo de tipos e respostas.

### Estratégia
Frontend e Backend definem contratos sobre os dados que trocam:

```
Frontend (Consumidor)                Backend (Provedor)
    ↓                                    ↓
Define expectativa de resposta  →  Garante contrato
Interage com mock do backend    →  Verifica com casos reais
```

### Ferramentas

```bash
npm install --save-dev @pact-foundation/pact
```

### Exemplo 1: Contrato - Obter Evolução Clínica

**Arquivo**: `app/__pacts__/evolution.consumer.test.ts`

```typescript
import { Pact, Matchers } from '@pact-foundation/pact';
import path from 'path';

const { eachLike, like } = Matchers;

const provider = new Pact({
  consumer: 'EvolutionPageConsumer',
  provider: 'UTICareBackend',
  pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
  logLevel: 'INFO'
});

describe('Evolution API Contract - Consumer', () => {
  beforeAll(async () => {
    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  it('should fetch evolution data with correct structure', async () => {
    const evolutionData = {
      id: like('evolution-123'),
      bedId: like(1),
      patientId: like('patient-001'),
      hematoinfectious: {
        antibiotics: eachLike({
          id: 'abx-1',
          name: 'Ceftriaxona',
          startDate: '2026-03-20T00:00:00.000Z'
        }),
        temperature: '38.5',
        biomarkers: 'PCR: 8.5'
      },
      createdAt: '2026-03-28T10:30:00.000Z'
    };

    await provider
      .addInteraction({
        state: 'evolution exists for bed 1',
        uponReceiving: 'a request for evolution data',
        withRequest: {
          method: 'GET',
          path: '/api/evolution/1',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          body: evolutionData
        }
      });

    const response = await fetch('http://localhost:8000/api/evolution/1');
    const body = await response.json();

    expect(body.id).toBeDefined();
    expect(body.hematoinfectious.antibiotics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          startDate: expect.any(String)
        })
      ])
    );
  });

  it('should handle error when evolution not found', async () => {
    await provider
      .addInteraction({
        state: 'evolution does not exist',
        uponReceiving: 'a request for non-existent evolution',
        withRequest: {
          method: 'GET',
          path: '/api/evolution/99999',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        willRespondWith: {
          status: 404,
          body: {
            error: 'Evolution not found'
          }
        }
      });

    const response = await fetch('http://localhost:8000/api/evolution/99999');
    
    expect(response.status).toBe(404);
  });
});
```

**Arquivo**: `app/__pacts__/evolution.provider.test.ts` (Backend Verification)

```typescript
import { Pact, PactV3 } from '@pact-foundation/pact';
import path from 'path';
import { saveEvolution } from '@/app/actions/saveEvolution';

const provider = new Pact({
  consumer: 'EvolutionPageConsumer',
  provider: 'UTICareBackend',
  pactFilesOrDirs: [path.resolve(process.cwd(), 'pacts')],
  logLevel: 'INFO'
});

describe('Evolution API Contract - Provider Verification', () => {
  beforeAll(async () => {
    // Carregar pacts gerados pelo consumer
    const pactFiles = require.resolve('@pact-foundation/pact/dist/pact-cli');
  });

  it('should return evolution data matching consumer expectation', async () => {
    const result = await saveEvolution(1, 'doctor-001', {
      hematoinfectious: {
        antibiotics: [
          { name: 'Ceftriaxona', startDate: new Date('2026-03-20') }
        ],
        temperature: '38.5',
        biomarkers: 'PCR: 8.5'
      },
      hemodynamics: {},
      neurological: {}
    });

    // Verificar que estrutura retornada corresponde ao contrato esperado
    expect(result).toMatchObject({
      id: expect.any(String),
      bedId: expect.any(Number),
      hematoinfectious: expect.objectContaining({
        antibiotics: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            startDate: expect.any(Date)
          })
        ])
      })
    });
  });
});
```

### Contratos Definidos

**Arquivo**: `contracts.ts`

```typescript
// Tipos compartilhados entre Frontend e Backend
export interface AntibioticContract {
  id: string;
  name: string;
  startDate: string; // ISO 8601
  dosage?: string;
}

export interface HematoinfectiousContract {
  antibiotics: AntibioticContract[];
  cultures: Array<{ material: string; sensitivity: string }>;
  temperature: string; // "37.5" format
  biomarkers: string;
  corticoids: string;
  observations: string;
}

export interface EvolutionContract {
  id: string;
  bedId: number;
  patientId: string;
  hematoinfectious: HematoinfectiousContract;
  hemodynamics: any; // Expandir conforme necessário
  neurological: any;
  createdAt: string; // ISO 8601
}

// Validadores
export function validateEvolutionContract(data: any): data is EvolutionContract {
  return (
    typeof data.id === 'string' &&
    typeof data.bedId === 'number' &&
    data.hematoinfectious &&
    Array.isArray(data.hematoinfectious.antibiotics)
  );
}
```

### Checklist Implementação Nível 3

- [ ] Pact.js instalado e configurado
- [ ] Contratos para todas as APIs internas definidos
- [ ] Consumer tests criados (Frontend expectations)
- [ ] Provider tests criados (Backend verification)
- [ ] Pact files gerados em `pacts/`
- [ ] CI/CD verifica contratos a cada build
- [ ] Documentação de breaking changes setup

---

## 🎯 NÍVEL 4: TESTES E2E (End-to-End)

### Objetivo
Testar fluxos críticos do usuário: Happy Path (caso ideal) e Exception Flows (erros)

### Ferramentas

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Estrutura

```
app/
  e2e-tests/
    fixtures/
      auth.ts
      database.ts
    helpers/
      loginHelper.ts
      fillFormHelper.ts
    specs/
      happy-path.spec.ts
      exception-flows.spec.ts
      patient-evolution.spec.ts
```

### Exemplo 1: Happy Path - Registrar Evolução Clínica

**Arquivo**: `app/e2e-tests/specs/patient-evolution.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { loginHelper } from '../helpers/loginHelper';
import { fillFormHelper } from '../helpers/fillFormHelper';

test.describe('Patient Evolution Registration - Happy Path', () => {
  let page;
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('should complete hematoinfectious evolution registration successfully', async ({
    page
  }) => {
    // PASSO 1: Login
    await loginHelper(page, 'doctor@hospital.com', 'password123');
    
    // Verificar que dashboard carregou
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // PASSO 2: Navegar para cama de paciente
    await page.click('text=Cama UTI-001');
    await expect(page.url()).toContain('/dashboard/1');

    // PASSO 3: Acessar evolução clínica
    await page.click('text=Nova Evolução');
    await expect(page.url()).toContain('/evolution');
    await expect(page.locator('text=Evolução Clínica')).toBeVisible();

    // PASSO 4: Preencher formulário Hematoinfeccioso
    await fillFormHelper(page, {
      section: 'hematoinfectious',
      data: {
        temperature: '38.5',
        biomarkers: 'PCR: 8.5 mg/dL',
        corticoids: 'Dexametasona 10mg'
      }
    });

    // PASSO 5: Adicionar antibiótico
    await page.click('text=Adicionar Antibiótico');
    await page.click('[data-test="antibiotic-select"]');
    await page.click('text=Ceftriaxona');
    await expect(
      page.locator('text=Ceftriaxona (D0)')
    ).toBeVisible({ timeout: 5000 });

    // PASSO 6: Adicionar cultura
    await page.click('text=Adicionar Cultura');
    await page.fill('[data-test="culture-material"]', 'Sangue');
    await page.fill('[data-test="culture-sensitivity"]', 'Sensível');

    // PASSO 7: Salvar evolução
    await page.click('button:has-text("Salvar Evolução")');

    // PASSO 8: Verificar sucesso
    await expect(
      page.locator('text=Evolução salva com sucesso')
    ).toBeVisible({ timeout: 5000 });

    // PASSO 9: Voltar ao dashboard e verificar que evolução foi registrada
    await page.click('text=Voltar ao Dashboard');
    await expect(page.locator('[data-test="evolution-card"]')).toBeVisible();
    await expect(
      page.locator('[data-test="evolution-date"]:has-text("28/03/2026")')
    ).toBeVisible();
  });

  test('should calculate antibiotic days correctly during evolution', async ({
    page
  }) => {
    await loginHelper(page, 'doctor@hospital.com', 'password123');
    await page.click('text=Cama UTI-001');
    await page.click('text=Nova Evolução');

    // Adicionar antibiótico iniciado há 5 dias
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);

    await page.click('text=Adicionar Antibiótico');
    await page.fill('[data-test="antibiotic-start-date"]', 
      startDate.toISOString().split('T')[0]);
    await page.click('text=Ceftriaxona');

    // Verificar que mostra "D5"
    const antibiotic = page.locator('text=/Ceftriaxona \(D[45]\)/');
    await expect(antibiotic).toBeVisible();
  });

  test('should support draft evolution (save without final submission)', async ({
    page
  }) => {
    await loginHelper(page, 'doctor@hospital.com', 'password123');
    await page.click('text=Cama UTI-001');
    await page.click('text=Nova Evolução');

    await fillFormHelper(page, {
      section: 'hematoinfectious',
      data: { temperature: '37.0' }
    });

    // Salvar como rascunho
    await page.click('button:has-text("Salvar como Rascunho")');
    await expect(
      page.locator('text=Rascunho salvo')
    ).toBeVisible();

    // Recarregar página e verificar que rascunho foi recuperado
    await page.reload();
    expect(
      page.locator('[data-test="temperature-input"]').inputValue()
    ).toBe('37.0');
  });
});
```

### Exemplo 2: Exception Flows

**Arquivo**: `app/e2e-tests/specs/exception-flows.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { loginHelper } from '../helpers/loginHelper';

test.describe('Patient Evolution - Exception Flows', () => {
  test('should show error when patient not found', async ({ page }) => {
    await loginHelper(page, 'doctor@hospital.com', 'password123');
    
    // Tentar acessar cama inexistente
    await page.goto('/dashboard/99999/evolution');

    await expect(
      page.locator('text=Paciente não encontrado')
    ).toBeVisible();
  });

  test('should validate required fields before submission', async ({ page }) => {
    await loginHelper(page, 'doctor@hospital.com', 'password123');
    await page.click('text=Cama UTI-001');
    await page.click('text=Nova Evolução');

    // Tentar submeter sem preencher campos obrigatórios
    await page.click('button:has-text("Salvar Evolução")');

    await expect(
      page.locator('text=Temperatura é obrigatória')
    ).toBeVisible();
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    await loginHelper(page, 'doctor@hospital.com', 'password123');
    await page.click('text=Cama UTI-001');
    await page.click('text=Nova Evolução');

    // Simular timeout
    await page.route('**/api/evolution', route => {
      setTimeout(() => route.abort('timedout'), 10000);
    });

    await page.fill('[data-test="temperature-input"]', '38.0');
    await page.click('button:has-text("Salvar Evolução")');

    await expect(
      page.locator('text=Conexão expirada|Tente novamente')
    ).toBeVisible({ timeout: 15000 });
  });

  test('should prevent duplicate submission with loading state', async ({ page }) => {
    await loginHelper(page, 'doctor@hospital.com', 'password123');
    await page.click('text=Cama UTI-001');
    await page.click('text=Nova Evolução');

    await page.fill('[data-test="temperature-input"]', '38.0');

    const submitButton = page.locator('button:has-text("Salvar Evolução")');

    // Clique duplo rápido
    await submitButton.click();
    await submitButton.click();

    // Verificar que botão foi desabilitado
    await expect(submitButton).toBeDisabled();
    
    // Verificar apenas uma requisição foi feita
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/evolution')) {
        requests.push(request);
      }
    });

    await page.waitForTimeout(2000);
    expect(requests).toHaveLength(1);
  });

  test('should handle concurrent evolution saves', async ({ page, context }) => {
    // Abrir duas abas do mesmo paciente
    const page2 = await context.newPage();

    await loginHelper(page, 'doctor@hospital.com', 'password123');
    await loginHelper(page2, 'doctor@hospital.com', 'password123');

    await page.click('text=Cama UTI-001');
    await page.click('text=Nova Evolução');

    await page2.click('text=Cama UTI-001');
    await page2.click('text=Nova Evolução');

    // Ambas preenchem e salvam
    await page.fill('[data-test="temperature-input"]', '38.0');
    await page.click('button:has-text("Salvar Evolução")');

    await page2.fill('[data-test="temperature-input"]', '37.0');
    await page2.click('button:has-text("Salvar Evolução")');

    // Segunda aba deve receber aviso de conflito
    await expect(
      page2.locator('text=Evolução já foi atualizada|Recarregue')
    ).toBeVisible({ timeout: 5000 });
  });
});
```

### Playwright Configuration

**Arquivo**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './app/e2e-tests/specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### Checklist Implementação Nível 4

- [ ] Playwright instalado e configurado
- [ ] Happy Path tests criados para todos fluxos críticos
- [ ] Exception Flow tests para casos de erro
- [ ] Fixtures para autenticação e dados
- [ ] Screenshots/videos de falhas capturados
- [ ] Testes executam em Chrome, Firefox
- [ ] CI/CD pipeline executa E2E tests
- [ ] Documentação de fluxos testados

---

## ⚡ NÍVEL 5: TESTES DE PERFORMANCE

### Objetivo
Garantir que sistema atende SLAs (Service Level Agreements) de latência e throughput.

### SLAs Definidos

| Operação | Target | Limite Alerta |
|----------|--------|---------------|
| Carregar Dashboard | < 1s | 2s |
| Salvar Evolução | < 500ms | 1s |
| Listar pacientes (50 records) | < 500ms | 1.5s |
| Query de banco (Evolução) | < 100ms | 200ms |
| Carregar formulário | < 300ms | 600ms |

### Ferramentas

```bash
npm install --save-dev k6 artillery autocannon
npm install --save-dev lighthouse
```

### Exemplo 1: Teste de Carga com k6

**Arquivo**: `app/e2e-tests/performance/evolution-load.js`

```javascript
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp-up to 20 users
    { duration: '1m30s', target: 20 }, // Stay at 20 users
    { duration: '20s', target: 0 }     // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // Latência
    http_req_failed: ['rate<0.05'] // Taxa de erro < 5%
  },
  ext: {
    loadimpact: {
      projectID: 3504953,
      name: 'UTI Care - Evolution Load Test'
    }
  }
};

const BASE_URL = 'http://localhost:3000';
const TOKEN = 'your-jwt-token'; // Obter via setup

export function setup() {
  let authRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'doctor@hospital.com',
    password: 'password123'
  });

  check(authRes, { 'auth successful': r => r.status === 200 });

  return { token: authRes.json('token') };
}

export default function (data) {
  const token = data.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  group('GET Evolution List', () => {
    let response = http.get(`${BASE_URL}/api/evolutions`, {
      headers: headers
    });

    check(response, {
      'status is 200': r => r.status === 200,
      'response time < 500ms': r => r.timings.duration < 500,
      'has evolution data': r => r.json('data.length') > 0
    });
  });

  sleep(1);

  group('POST Save Evolution', () => {
    const payload = {
      bedId: 1,
      hematoinfectious: {
        temperature: '38.5',
        biomarkers: 'PCR: 8.5',
        antibiotics: [],
        cultures: []
      },
      hemodynamics: {},
      neurological: {}
    };

    let response = http.post(`${BASE_URL}/api/evolution`, JSON.stringify(payload), {
      headers: headers
    });

    check(response, {
      'status is 200': r => r.status === 200,
      'response time < 500ms': r => r.timings.duration < 500,
      'has evolution id': r => r.json('data.id') !== null
    });
  });

  sleep(2);
}
```

**Executar:**
```bash
k6 run app/e2e-tests/performance/evolution-load.js
```

### Exemplo 2: Teste de Stress com Artillery

**Arquivo**: `artillery-config.yml`

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 20
      name: "Ramp up"
    - duration: 300
      arrivalRate: 50
      name: "Stress test"
    - duration: 60
      arrivalRate: 0
      name: "Ramp down"

  processor: "./performance-processor.js"
  variables:
    token: "{{ $processEnvironment.AUTH_TOKEN }}"
    bedId: "1"

scenarios:
  - name: "Evolution Registration Flow"
    flow:
      - get:
          url: "/api/bed/{{ bedId }}"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - contentType: json

      - post:
          url: "/api/evolution"
          headers:
            Authorization: "Bearer {{ token }}"
            Content-Type: application/json
          json:
            bedId: 1
            hematoinfectious:
              temperature: "38.5"
              biomarkers: "PCR: 8.5"
          expect:
            - statusCode: 200
            - hasProperty: data.id

after:
  flow:
    - log: "Test completed"
```

**Executar:**
```bash
export AUTH_TOKEN=your-token
artillery run artillery-config.yml
```

### Exemplo 3: Lighthouse Performance Audit

**Arquivo**: `app/e2e-tests/performance/lighthouse-audit.js`

```javascript
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };

  const results = await lighthouse('http://localhost:3000/dashboard/1/evolution', options);

  const scores = results.lhr.categories;
  
  console.log(`
    Performance: ${scores.performance.score * 100}
    Accessibility: ${scores.accessibility.score * 100}
    Best Practices: ${scores['best-practices'].score * 100}
    SEO: ${scores.seo.score * 100}
  `);

  // Avaliar SLA
  if (scores.performance.score < 0.75) {
    console.error('❌ Performance SLA violado! Score < 75');
    process.exit(1);
  }

  await chrome.kill();
}

runLighthouse().catch(console.error);
```

### Database Query Performance

**Arquivo**: `app/__tests__/performance/prisma-queries.perf.test.ts`

```typescript
import { PrismaClient } from '@prisma/client';

describe('Prisma Query Performance', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  it('should fetch evolution with related data in < 100ms', async () => {
    const startTime = performance.now();

    const evolution = await prisma.clinicalEvolution.findUnique({
      where: { id: '1' },
      include: {
        doctor: true,
        patient: {
          include: { bed: true }
        }
      }
    });

    const duration = performance.now() - startTime;

    expect(evolution).toBeDefined();
    expect(duration).toBeLessThan(100);
  });

  it('should list evolutions with pagination in < 200ms', async () => {
    const startTime = performance.now();

    const evolutions = await prisma.clinicalEvolution.findMany({
      take: 20,
      skip: 0,
      orderBy: { created_at: 'desc' },
      include: { doctor: true, patient: true }
    });

    const duration = performance.now() - startTime;

    expect(evolutions.length).toBeLessThanOrEqual(20);
    expect(duration).toBeLessThan(200);
  });
});
```

### Checklist Implementação Nível 5

- [ ] SLAs definidos para operações críticas
- [ ] k6 load tests criados
- [ ] Artillery stress tests configurados
- [ ] Lighthouse performance audits implementados
- [ ] Bancos de dados e consultas otimizadas
- [ ] Métricas de performance monitoradas
- [ ] CI/CD falha se SLAs são violados
- [ ] Relatórios de performance gerados

---

## 🔒 NÍVEL 6: TESTES DE SEGURANÇA

### Objetivo
Verificar vulnerabilidades OWASP Top 10 e práticas seguras.

### Checklist OWASP Top 10 (2024)

| # | Vulnerabilidade | Teste | Ferramenta |
|---|-----------------|-------|-----------|
| 1 | Broken Access Control | Verificar autorização em endpoints | Manual + ZAP |
| 2 | Cryptographic Failures | Dados sensíveis encriptados? | npm audit, npm-check |
| 3 | Injection (SQL, NoSQL, Command) | Verificar SQLi, NoSQLi | OWASP ZAP, npm audit |
| 4 | Insecure Design | Falta validação de entrada | Manual review + Jest |
| 5 | Security Misconfiguration | Headers de segurança, CORS | ZAP, Manual |
| 6 | Vulnerable Dependencies | Packages desatualizados | npm audit, Snyk |
| 7 | Authentication Failures | JWT expiração, brute force | Manual + E2E |
| 8 | Data Integrity Failures | CSRF, race conditions | ZAP, manual |
| 9 | Logging & Monitoring | Auditoria de ações sensíveis | Code review |
| 10 | SSRF (Server-Side Request Forgery) | Requisições não validadas | Manual + ZAP |

### Exemplo 1: Teste de Injeção SQL

**Arquivo**: `app/__tests__/security/sql-injection.test.ts`

```typescript
import { saveEvolution } from '@/app/actions/saveEvolution';
import { PrismaClient } from '@prisma/client';

describe('SQL Injection Prevention', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  it('should prevent SQL injection in temperature field', async () => {
    const maliciousPayload = {
      hematoinfectious: {
        temperature: "38.5'; DROP TABLE clinical_evolutions; --",
        biomarkers: 'PCR: 8.5'
      },
      hemodynamics: {},
      neurological: {}
    };

    // Prisma usa prepared statements, deve ser seguro
    const result = await saveEvolution(1, 'doctor-1', maliciousPayload);

    // Verificar que houve erro ou foi tratado
    expect(result).toBeDefined();

    // Verificar que tabela ainda existe
    const count = await prisma.clinicalEvolution.count();
    expect(count).toBeGreaterThan(0);
  });

  it('should sanitize special characters in observations', async () => {
    const xssPayload = {
      hematoinfectious: {
        temperature: '38.5',
        observations: '<script>alert("XSS")</script>'
      },
      hemodynamics: {},
      neurological: {}
    };

    const result = await saveEvolution(1, 'doctor-1', xssPayload);

    // Verificar que script foi escapado ou removido
    const saved = await prisma.clinicalEvolution.findUnique({
      where: { id: result.id }
    });

    expect(saved?.hematoinfectious.observations).not.toContain('<script>');
  });
});
```

### Exemplo 2: Teste de Autenticação e Autorização

**Arquivo**: `app/e2e-tests/specs/security-auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization Security', () => {
  test('should reject request without JWT token', async ({ page }) => {
    const response = await page.evaluate(async () => {
      return fetch('http://localhost:3000/api/evolution/1');
    });

    // Deve retornar 401 Unauthorized
    expect(response.status).toBe(401);
  });

  test('should reject expired JWT token', async ({ page }) => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE...';

    const response = await page.evaluate(
      async (token) => {
        return fetch('http://localhost:3000/api/evolution/1', {
          headers: { Authorization: `Bearer ${token}` }
        });
      },
      expiredToken
    );

    expect(response.status).toBe(401);
  });

  test('should prevent accessing other doctors\' evolutions', async ({ page, context }) => {
    // Login como doctor1
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'doctor1@hospital.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Obter token de doctor1
    const doctor1Token = await page.evaluate(() => 
      localStorage.getItem('authToken')
    );

    // Logout
    await page.click('button:has-text("Logout")');

    // Login como doctor2
    await page.fill('[name="email"]', 'doctor2@hospital.com');
    await page.fill('[name="password"]', 'password456');
    await page.click('button:has-text("Login")');

    // Tentar acessar evolução criada por doctor1
    const response = await page.evaluate(
      async (token) => {
        return fetch('http://localhost:3000/api/evolution/doctor1-evolution-123', {
          headers: { Authorization: `Bearer ${token}` }
        });
      },
      doctor1Token
    );

    expect(response.status).toBe(403); // Forbidden
  });
});
```

### Exemplo 3: Teste de CORS e Headers de Segurança

**Arquivo**: `app/__tests__/security/headers.test.ts`

```typescript
import fetch from 'node-fetch';

describe('Security Headers & CORS', () => {
  const baseURL = 'http://localhost:3000';

  it('should include security headers', async () => {
    const response = await fetch(`${baseURL}/api/evolution`);

    // Verificar headers de segurança
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toMatch(/DENY|SAMEORIGIN/);
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(response.headers.get('Strict-Transport-Security')).toBeTruthy();
  });

  it('should implement CORS correctly', async () => {
    const response = await fetch(`${baseURL}/api/evolution`, {
      headers: {
        Origin: 'http://malicious.com'
      }
    });

    // Não deve permitir CORS de domínios não autorizados
    const accessControl = response.headers.get(
      'Access-Control-Allow-Origin'
    );
    
    expect(accessControl).not.toBe('*');
    expect(accessControl).toBeNull(); // Se não é público
  });
});
```

### OWASP ZAP Integration

**Arquivo**: `zap-config.yaml`

```yaml
ZAP Baseline Scan:
  target: "http://localhost:3000"
  rules:
    - 10010 # Cache Control
    - 10015 # Retry-After
    - 20019 # Content-Type Header Missing
    - 10009 # In Page Banner Information Leak
    - 10027 # Information Disclosure - Suspicious Comments
    - 10034 # Information Disclosure - Descriptive Comments
    - 40012 # Cross Site Scripting (DOM Based)
    - 40014 # Cross Site Scripting (Persistent)
    - 40016 # Cross Site Scripting (Reflected)
    - 40018 # SQL Injection
    - 40020 # Insecure Direct Object References
    - 40029 # Insecure HTTP Method

  reportTitle: "UTI Care Security Report"
```

### npm Audit & Dependency Check

**Archivo**: `package.json` scripts

```json
{
  "scripts": {
    "security:check": "npm audit --audit-level=moderate && npm outdated",
    "security:fix": "npm audit fix",
    "security:report": "npm audit --json > audit-report.json"
  }
}
```

### Checklist Implementação Nível 6

- [ ] OWASP ZAP baseline scan integrado em CI/CD
- [ ] npm audit executado em todos builds
- [ ] Testes de SQL Injection automatizados
- [ ] Testes de XSS/CSRF implementados
- [ ] Security headers verificados
- [ ] CORS corretamente configurado
- [ ] JWT expiração testada
- [ ] Autorização role-based testada
- [ ] Dados sensíveis encriptados em repouso
- [ ] Relatório de segurança gerado

---

## 🔄 NÍVEL 7: TESTES DE RESILIÊNCIA (Chaos Engineering)

### Objetivo
Verificar como o sistema se comporta durante falhas (Graceful Degradation).

### Cenários de Caos

| Cenário | Impacto Esperado | Teste |
|---------|-----------------|-------|
| Database Down | 503 com mensagem amigável | Simular conexão refused |
| Latência de BD 5s+ | Timeout controlado | Delay em queries |
| Out of Memory | Erro sem crash | Memory pressure |
| Requisição externa falha | Fallback ou retry | API timeout |
| Múltiplas instâncias caem | Failover automático | Matar pods |

### Exemplo 1: Simular Falha de Banco de Dados

**Arquivo**: `app/__tests__/resilience/database-failure.test.ts`

```typescript
import { saveEvolution } from '@/app/actions/saveEvolution';
import { PrismaClient } from '@prisma/client';

describe('Resilience - Database Failures', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  it('should gracefully handle database connection timeout', async () => {
    // Simular timeout de conexão
    const originalCreate = prisma.clinicalEvolution.create;
    
    prisma.clinicalEvolution.create = jest.fn(async () => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);
      });
    });

    const result = await saveEvolution(1, 'doctor-1', {
      hematoinfectious: {},
      hemodynamics: {},
      neurological: {}
    }).catch(err => ({ error: err.message }));

    expect(result.error).toContain('Connection timeout');

    // Restaurar
    prisma.clinicalEvolution.create = originalCreate;
  });

  it('should implement retry logic for transient failures', async () => {
    let attempts = 0;
    const maxRetries = 3;

    const retryWithBackoff = async (fn, retries = maxRetries) => {
      try {
        return await fn();
      } catch (err) {
        if (attempts++ < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, 100 * Math.pow(2, attempts))
          );
          return retryWithBackoff(fn, retries);
        }
        throw err;
      }
    };

    const failTwiceThenSucceed = jest.fn()
      .mockRejectedValueOnce(new Error('Transient error 1'))
      .mockRejectedValueOnce(new Error('Transient error 2'))
      .mockResolvedValueOnce({ id: 'evolution-1' });

    const result = await retryWithBackoff(failTwiceThenSucceed);

    expect(result.id).toBe('evolution-1');
    expect(failTwiceThenSucceed).toHaveBeenCalledTimes(3);
  });
});
```

### Exemplo 2: Chaos Test com LocalStack

**Arquivo**: `docker-compose.chaos.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: uti_care_test
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  chaos-proxy:
    image: toxiproxy:latest
    ports:
      - "5432:5432"
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432

  app:
    build: .
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@chaos-proxy:5432/uti_care_test
      NODE_ENV: test
```

**Arquivo**: `app/__tests__/resilience/chaos-scenarios.test.ts`

```typescript
import { toxiproxy } from 'toxiproxy';

describe('Chaos Engineering - Database Resilience', () => {
  let api: any;

  beforeAll(async () => {
    api = new toxiproxy.ApiClient({ host: 'localhost', port: 8474 });
  });

  it('should handle database latency injection', async () => {
    // Injetar 2 segundos de latência
    await api.createProxy({
      name: 'postgres_chaos',
      listen: 'localhost:5432',
      upstream: 'postgres:5432'
    });

    await api.addToxic('postgres_chaos', {
      type: 'latency',
      enabled: true,
      toxicName: 'postgres_latency',
      attributes: {
        latency: 2000 // 2 segundos
      }
    });

    const startTime = Date.now();

    try {
      await saveEvolution(1, 'doctor-1', {
        hematoinfectious: {},
        hemodynamics: {},
        neurological: {}
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      // Deve ter timeout > 2s
      expect(duration).toBeGreaterThan(2000);
    }

    // Remover toxina
    await api.removeToxic('postgres_chaos', 'postgres_latency');
  });

  it('should handle connection drop during transaction', async () => {
    // Simular drop de conexão
    await api.createProxy({
      name: 'postgres_drop',
      listen: 'localhost:5433',
      upstream: 'postgres:5432'
    });

    const toxic = {
      type: 'down',
      enabled: true,
      toxicName: 'postgres_down',
      attributes: {}
    };

    await api.addToxic('postgres_drop', toxic);

    // Operação deve falhar de forma controlada
    await expect(
      saveEvolution(1, 'doctor-1', {})
    ).rejects.toThrow();

    await api.removeToxic('postgres_drop', 'postgres_down');
  });

  it('should handle bandwidth throttling', async () => {
    await api.createProxy({
      name: 'postgres_throttle',
      listen: 'localhost:5434',
      upstream: 'postgres:5432'
    });

    // Limitar a 10 KB/s
    await api.addToxic('postgres_throttle', {
      type: 'bandwidth',
      enabled: true,
      toxicName: 'postgres_bandwidth',
      attributes: {
        rate: 10 // KB/s
      }
    });

    const startTime = Date.now();

    try {
      await saveEvolution(1, 'doctor-1', {
        hematoinfectious: { observation: 'A'.repeat(1000000) } // 1MB
      });
    } catch {
      // Esperado falhar com timeout
    }

    const duration = Date.now() - startTime;
    expect(duration).toBeGreaterThan(5000); // Deve levar > 5s

    await api.removeToxic('postgres_throttle', 'postgres_bandwidth');
  });
});
```

### Exemplo 3: Circuit Breaker Pattern

**Arquivo**: `app/lib/circuitBreaker.ts`

```typescript
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private successCount = 0;

  constructor(
    private threshold = 5,
    private timeout = 60000, // 1 minuto
    private resetAttempts = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - (this.lastFailureTime ?? 0) > this.timeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.successCount++;
        if (this.successCount >= this.resetAttempts) {
          this.state = CircuitBreakerState.CLOSED;
          this.failureCount = 0;
        }
      }

      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = CircuitBreakerState.OPEN;
      }

      throw err;
    }
  }
}

// Uso
const dbCircuitBreaker = new CircuitBreaker(5, 60000, 3);

export async function saveEvolutionWithCircuitBreaker(
  bedId: number,
  doctorId: string,
  data: any
) {
  try {
    return await dbCircuitBreaker.execute(() =>
      saveEvolution(bedId, doctorId, data)
    );
  } catch (err) {
    console.error('Serviço unavailable - retornando resposta em cache');
    return getCachedEvolution(bedId);
  }
}
```

### Teste do Circuit Breaker

**Arquivo**: `app/__tests__/resilience/circuit-breaker.test.ts`

```typescript
import { CircuitBreaker } from '@/app/lib/circuitBreaker';

describe('Circuit Breaker Pattern', () => {
  it('should open after threshold failures', async () => {
    const breaker = new CircuitBreaker(3, 1000, 2);

    const failingFn = jest.fn().mockRejectedValue(new Error('Error'));

    // 3 falhas
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }

    // 4ª tentativa deve falhar imediatamente com "Circuit breaker is OPEN"
    await expect(breaker.execute(failingFn)).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    const breaker = new CircuitBreaker(2, 100, 2); // 100ms timeout

    const failingFn = jest.fn().mockRejectedValue(new Error('Error'));

    // 2 falhas = OPEN
    for (let i = 0; i < 2; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }

    // Esperar timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Mock successo
    const successFn = jest.fn().mockResolvedValue({ data: 'ok' });

    // Deve permitir requisição HALF_OPEN
    const result = await breaker.execute(successFn);
    expect(result).toEqual({ data: 'ok' });
  });

  it('should reset to CLOSED after successful HALF_OPEN attempts', async () => {
    const breaker = new CircuitBreaker(1, 100, 2);

    let callCount = 0;
    const failThenSucceed = jest.fn(async () => {
      if (callCount++ === 0) {
        throw new Error('Fail');
      }
      return { data: 'ok' };
    });

    // Primeira falha = OPEN
    await expect(breaker.execute(failThenSucceed)).rejects.toThrow();

    // Aguardar timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Reset attempts HALF_OPEN
    for (let i = 0; i < 2; i++) {
      await breaker.execute(failThenSucceed);
    }

    // Deve estar CLOSED agora
    // Próximas requisições devem funcionar normalmente
    const result = await breaker.execute(failThenSucceed);
    expect(result).toEqual({ data: 'ok' });
  });
});
```

### Checklist Implementação Nível 7

- [ ] Circuit Breaker pattern implementado
- [ ] Retry com exponential backoff implementado
- [ ] Fallback strategies definidas
- [ ] Timeouts configurados em todas async operations
- [ ] Toxiproxy/chaos tests setup
- [ ] Database failure scenarios testados
- [ ] Network degradation simulated
- [ ] Graceful degradation verificado
- [ ] Error handling e logging abrangente
- [ ] Disaster recovery plan documentado

---

## 📊 SUMMARY: Matriz de Cobertura Total

```
┌─────────────────────────────────────────────────────────────────────┐
│                  UTI CARE - MATRIZ DE COBERTURA DE TESTES           │
├─────────┬──────────────────┬──────────────┬─────────────────────────┤
│ Nível   │ Escopo           │ Coverage     │ Status                  │
├─────────┼──────────────────┼──────────────┼─────────────────────────┤
│ 1       │ Unitários        │ 80-90%       │ ✅ Em Implementação     │
│ 2       │ Integração       │ 70-80%       │ ✅ Em Implementação     │
│ 3       │ Contrato (Pact)  │ 100%         │ ✅ Em Implementação     │
│ 4       │ E2E (Playwright) │ Fluxos críti │ ✅ Em Implementação     │
│ 5       │ Performance      │ SLA-based    │ ✅ Em Implementação     │
│ 6       │ Segurança (OWASP)│ Critical=0   │ ✅ Em Implementação     │
│ 7       │ Resiliência      │ Chaos-based  │ ✅ Em Implementação     │
└─────────┴──────────────────┴──────────────┴─────────────────────────┘
```

## 🚀 Pipeline CI/CD Proposto

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm test -- --coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test
      
  security:
    runs-on: ubuntu-latest
    steps:
      - run: npm audit --audit-level=moderate
      - run: npx owasp-zap-baseline-scan
      
  performance:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:performance:load
      - run: npm run test:performance:lighthouse
      
  chaos:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:chaos
```

## 📚 Próximos Passos

1. **Setup Inicial** (Semana 1)
   - [ ] Instalar ferramentas (Jest, Playwright, k6, ZAP)
   - [ ] Configurar ambiente de testes
   - [ ] Setup de CI/CD

2. **Testes Base** (Semana 2-3)
   - [ ] Implementar testes unitários
   - [ ] Setup de cobertura
   - [ ] Atingir 80% coverage

3. **Integração & E2E** (Semana 4-5)
   - [ ] Testes de integração
   - [ ] E2E tests com Playwright
   - [ ] Contratos Pact

4. **Avançados** (Semana 6-8)
   - [ ] Performance tests
   - [ ] Security scanning
   - [ ] Chaos engineering

---

**Documento Criado**: 28/03/2026  
**Última Atualização**: 28/03/2026  
**Versão**: 1.0  
**Próxima Review**: 28/04/2026
