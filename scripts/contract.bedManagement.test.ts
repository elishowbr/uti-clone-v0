/**
 * Testes de Contrato — bedManagement.ts (Nível 3 QA Strategy)
 *
 * Objetivo: garantir sincronismo de shapes/tipos entre o consumidor
 * (Dashboard page, modais de admissão/alta) e o provedor (Server Actions).
 *
 * Diferença em relação aos testes de integração:
 *  - Integração → verifica SE o Prisma foi chamado com os argumentos corretos
 *  - Contrato   → verifica SE o retorno da action tem o shape que o consumidor espera
 *
 * Contratos cobertos:
 *  C1 — getDashboardData  → Dashboard page (BedCard)
 *  C2 — createBed         → Modal de criação de leito
 *  C3 — admitPatient      → Modal de admissão
 *  C4 — dischargePatient  → Botão de alta
 *  C5 — finishCleaning    → Botão finalizar limpeza
 *  C6 — setBedToCleaning  → Botão iniciar limpeza
 *  C7 — deleteBed         → Modal de exclusão
 *  C8 — Contrato de enum BedStatus (valores válidos)
 *  C9 — Contrato de shape de erro (todos os erros são { success: false, error: string })
 */

import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '@/app/generated/prisma/client';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import prismaImport from '@/lib/prisma';
const prismaMock = prismaImport as DeepMockProxy<PrismaClient>;

import {
  getDashboardData,
  createBed,
  admitPatient,
  dischargePatient,
  finishCleaning,
  setBedToCleaning,
  deleteBed,
} from '@/app/actions/bedManagement';

// ─── Tipos esperados pelo consumidor (Dashboard page) ─────────────────────────

/** Shape que o componente BedCard da Dashboard consome */
interface BedCardContract {
  id: number;
  bed_number: number;
  label: string | null;
  type: string | null;
  status: 'VACANT' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
  current_patient_id: number | null;
  current_patient: {
    id: number;
    name: string;
    admission_date: Date;
    birth_date: Date | null;
  } | null;
  clinical_evolutions: Array<{
    created_at: Date;
    generated_text: string | null;
  }>;
}

/** Shape de sucesso genérico que todas as actions de mutação retornam */
interface SuccessContract {
  success: true;
}

/** Shape de erro genérico que todas as actions de mutação retornam */
interface ErrorContract {
  success: false;
  error: string;
}

// ─── Fábricas ─────────────────────────────────────────────────────────────────

const makeDbBed = (overrides = {}) => ({
  id: 1,
  bed_number: 1,
  label: 'Leito 01',
  type: 'UTI Geral',
  status: 'VACANT' as const,
  current_patient_id: null,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
  current_patient: null,
  clinical_evolutions: [],
  ...overrides,
});

const makeDbPatient = (overrides = {}) => ({
  id: 10,
  name: 'João Silva',
  birth_date: new Date('1970-03-20'),
  height: 175,
  weight: 80,
  gender: 'MALE' as const,
  commentary: null,
  arrival_date: null,
  admission_date: new Date('2026-05-01'),
  discharge_date: null,
  created_at: new Date('2026-05-01'),
  updated_at: new Date('2026-05-01'),
  ...overrides,
});

beforeEach(() => mockReset(prismaMock as any));

// ─── C1: getDashboardData → BedCard consumer ─────────────────────────────────
describe('C1 — Contrato: getDashboardData → Dashboard BedCard', () => {
  it('retorna array de leitos com shape completo esperado pelo BedCard', async () => {
    const dbBed = makeDbBed({
      status: 'OCCUPIED',
      current_patient_id: 10,
      current_patient: makeDbPatient(),
      clinical_evolutions: [
        { created_at: new Date('2026-05-07'), generated_text: 'Evolução do dia' },
      ],
    });

    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([dbBed]);
    const result = await getDashboardData();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);

    const bed = result[0] as BedCardContract;

    // Campos primitivos obrigatórios
    expect(typeof bed.id).toBe('number');
    expect(typeof bed.bed_number).toBe('number');
    expect(typeof bed.status).toBe('string');

    // Enum BedStatus: valor deve ser um dos 4 válidos
    expect(['VACANT', 'OCCUPIED', 'CLEANING', 'MAINTENANCE']).toContain(bed.status);

    // Paciente aninhado
    expect(bed.current_patient).not.toBeNull();
    expect(typeof bed.current_patient!.id).toBe('number');
    expect(typeof bed.current_patient!.name).toBe('string');
    expect(bed.current_patient!.admission_date).toBeInstanceOf(Date);

    // Evoluções aninhadas
    expect(Array.isArray(bed.clinical_evolutions)).toBe(true);
    expect(bed.clinical_evolutions[0].created_at).toBeInstanceOf(Date);
    expect(typeof bed.clinical_evolutions[0].generated_text === 'string'
      || bed.clinical_evolutions[0].generated_text === null).toBe(true);
  });

  it('leito vago tem current_patient null e clinical_evolutions vazio', async () => {
    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([makeDbBed()]);
    const result = await getDashboardData();

    const bed = result[0] as BedCardContract;
    expect(bed.current_patient).toBeNull();
    expect(bed.clinical_evolutions).toEqual([]);
  });

  it('retorna array vazio quando não há leitos — consumidor deve renderizar lista vazia', async () => {
    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([]);
    const result = await getDashboardData();
    expect(result).toEqual([]);
  });

  it('status OCCUPIED é retornado como string literal exata', async () => {
    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([
      makeDbBed({ status: 'OCCUPIED', current_patient: makeDbPatient() }),
    ]);
    const result = await getDashboardData();
    expect(result[0].status).toBe('OCCUPIED');
  });

  it('status CLEANING é retornado como string literal exata', async () => {
    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([
      makeDbBed({ status: 'CLEANING' }),
    ]);
    const result = await getDashboardData();
    expect(result[0].status).toBe('CLEANING');
  });
});

// ─── C2: createBed → Modal de criação ────────────────────────────────────────
describe('C2 — Contrato: createBed → Modal de criação de leito', () => {
  it('retorna { success: true } em caso de sucesso — consumidor fecha modal', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockResolvedValue(makeDbBed());

    const result = await createBed(3);

    // Contrato: a propriedade success deve ser true (boolean)
    expect(result).toHaveProperty('success', true);
    expect(typeof result.success).toBe('boolean');
  });

  it('retorna { success: false, error: string } quando leito já existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeDbBed());

    const result = await createBed(1) as ErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('label é formatado como "Leito 0X" para número < 10 — consumidor exibe label formatado', async () => {
    let capturedData: any = null;
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockImplementation(({ data }) => {
      capturedData = data;
      return Promise.resolve(makeDbBed({ label: data.label }));
    });

    await createBed(5);

    // Contrato de formatação: frontend espera "Leito 05" para bed_number = 5
    expect(capturedData.label).toBe('Leito 05');
    expect(capturedData.type).toBe('UTI Geral');
    expect(capturedData.status).toBe('VACANT');
  });

  it('label é formatado como "Leito 10" para número >= 10', async () => {
    let capturedData: any = null;
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockImplementation(({ data }) => {
      capturedData = data;
      return Promise.resolve(makeDbBed({ label: data.label }));
    });

    await createBed(10);
    expect(capturedData.label).toBe('Leito 10');
  });
});

// ─── C3: admitPatient → Modal de admissão ────────────────────────────────────
describe('C3 — Contrato: admitPatient → Modal de admissão', () => {
  it('retorna { success: true } após admissão — consumidor recarrega dashboard', async () => {
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn(prismaMock));
    (prismaMock.patient.create as jest.Mock).mockResolvedValue(makeDbPatient());
    (prismaMock.bed.update as jest.Mock).mockResolvedValue(makeDbBed({ status: 'OCCUPIED' }));

    const result = await admitPatient(1, 'João Silva');

    expect(result).toHaveProperty('success', true);
    expect(typeof result.success).toBe('boolean');
  });

  it('paciente criado com admission_date = Date (não string) — contrato de tipo', async () => {
    let patientData: any = null;
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn(prismaMock));
    (prismaMock.patient.create as jest.Mock).mockImplementation(({ data }) => {
      patientData = data;
      return Promise.resolve(makeDbPatient());
    });
    (prismaMock.bed.update as jest.Mock).mockResolvedValue(makeDbBed());

    await admitPatient(1, 'João Silva');

    // Contrato: admission_date deve ser instância de Date, nunca string ISO
    expect(patientData.admission_date).toBeInstanceOf(Date);
    expect(typeof patientData.name).toBe('string');
  });

  it('leito atualizado com status OCCUPIED (string literal exata) após admissão', async () => {
    let bedUpdateData: any = null;
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn(prismaMock));
    (prismaMock.patient.create as jest.Mock).mockResolvedValue(makeDbPatient({ id: 42 }));
    (prismaMock.bed.update as jest.Mock).mockImplementation(({ data }) => {
      bedUpdateData = data;
      return Promise.resolve(makeDbBed());
    });

    await admitPatient(1, 'João Silva');

    // Contrato: o status enviado ao Prisma deve ser a string 'OCCUPIED'
    expect(bedUpdateData.status).toBe('OCCUPIED');
    expect(typeof bedUpdateData.current_patient_id).toBe('number');
  });

  it('retorna { success: false, error: string } quando transação falha', async () => {
    (prismaMock.$transaction as jest.Mock).mockRejectedValue(new Error('Rollback'));

    const result = await admitPatient(1, 'João') as ErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});

// ─── C4: dischargePatient → BedDetailsPage / botão de alta ───────────────────
describe('C4 — Contrato: dischargePatient → consumidor espera status CLEANING', () => {
  it('leito fica com status CLEANING após alta — consumidor renderiza card de limpeza', async () => {
    let bedUpdateData: any = null;
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(
      makeDbBed({ status: 'OCCUPIED', current_patient_id: 10, current_patient: makeDbPatient() })
    );
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makeDbPatient());
    (prismaMock.bed.update as jest.Mock).mockImplementation(({ data }) => {
      bedUpdateData = data;
      return Promise.resolve(makeDbBed({ status: 'CLEANING' }));
    });
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn(prismaMock));

    const result = await dischargePatient(1);

    expect(result).toHaveProperty('success', true);
    // Contrato: após alta, status do leito deve ser CLEANING (não VACANT direto)
    expect(bedUpdateData.status).toBe('CLEANING');
    // Contrato: paciente desvinculado do leito
    expect(bedUpdateData.current_patient_id).toBeNull();
  });

  it('patient recebe discharge_date como instância de Date (não string)', async () => {
    let patientUpdateData: any = null;
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(
      makeDbBed({ current_patient_id: 10, current_patient: makeDbPatient() })
    );
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      patientUpdateData = data;
      return Promise.resolve(makeDbPatient());
    });
    (prismaMock.bed.update as jest.Mock).mockResolvedValue(makeDbBed());
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn(prismaMock));

    await dischargePatient(1);

    // Contrato de tipo: discharge_date deve ser Date, nunca string ISO
    expect(patientUpdateData.discharge_date).toBeInstanceOf(Date);
  });

  it('retorna { success: false, error: string } quando leito não encontrado', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await dischargePatient(999) as ErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});

// ─── C5: finishCleaning → botão "Limpeza concluída" ──────────────────────────
describe('C5 — Contrato: finishCleaning → consumidor espera status VACANT', () => {
  it('leito fica com status VACANT após limpeza concluída', async () => {
    let bedUpdateData: any = null;
    (prismaMock.bed.update as jest.Mock).mockImplementation(({ data }) => {
      bedUpdateData = data;
      return Promise.resolve(makeDbBed({ status: 'VACANT' }));
    });

    const result = await finishCleaning(1);

    expect(result).toHaveProperty('success', true);
    // Contrato: após limpeza, status deve ser VACANT (não CLEANING)
    expect(bedUpdateData.status).toBe('VACANT');
  });

  it('retorna { success: false, error: string } quando Prisma falha', async () => {
    (prismaMock.bed.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await finishCleaning(1) as ErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});

// ─── C6: setBedToCleaning → botão "Iniciar limpeza" ──────────────────────────
describe('C6 — Contrato: setBedToCleaning → consumidor espera status CLEANING e patient desvinculado', () => {
  it('leito fica com status CLEANING e current_patient_id null', async () => {
    let bedUpdateData: any = null;
    (prismaMock.bed.update as jest.Mock).mockImplementation(({ data }) => {
      bedUpdateData = data;
      return Promise.resolve(makeDbBed({ status: 'CLEANING' }));
    });

    const result = await setBedToCleaning(1);

    expect(result).toHaveProperty('success', true);
    expect(bedUpdateData.status).toBe('CLEANING');
    expect(bedUpdateData.current_patient_id).toBeNull();
  });
});

// ─── C7: deleteBed → Modal de exclusão ───────────────────────────────────────
describe('C7 — Contrato: deleteBed → modal de exclusão', () => {
  it('retorna { success: true } para leito VACANT', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeDbBed({ status: 'VACANT' }));
    (prismaMock.bed.delete as jest.Mock).mockResolvedValue(makeDbBed());

    const result = await deleteBed(1);

    expect(result).toHaveProperty('success', true);
  });

  it('retorna { success: false, error: string } para leito OCCUPIED — consumidor exibe aviso', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeDbBed({ status: 'OCCUPIED' }));

    const result = await deleteBed(1) as ErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('retorna { success: false, error: string } quando leito não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await deleteBed(999) as ErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});

// ─── C8: Contrato de enum BedStatus ──────────────────────────────────────────
describe('C8 — Contrato de enum: BedStatus', () => {
  const VALID_BED_STATUSES = ['VACANT', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as const;

  it.each(VALID_BED_STATUSES)(
    'status "%s" é reconhecido como válido pelo consumidor',
    async (status) => {
      (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([makeDbBed({ status })]);
      const result = await getDashboardData();
      expect(VALID_BED_STATUSES).toContain(result[0].status);
    }
  );

  it('status retornado nunca é undefined ou null', async () => {
    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([makeDbBed({ status: 'VACANT' })]);
    const result = await getDashboardData();
    expect(result[0].status).toBeDefined();
    expect(result[0].status).not.toBeNull();
  });
});

// ─── C9: Contrato de shape de erro (consistência entre todas as actions) ──────
describe('C9 — Contrato: shape de erro é consistente em todas as actions de mutação', () => {
  beforeEach(() => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockRejectedValue(new Error('fail'));
    (prismaMock.$transaction as jest.Mock).mockRejectedValue(new Error('fail'));
    (prismaMock.bed.update as jest.Mock).mockRejectedValue(new Error('fail'));
    (prismaMock.bed.delete as jest.Mock).mockRejectedValue(new Error('fail'));
  });

  it('createBed retorna { success: boolean, error?: string } — nunca lança exceção', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeDbBed());
    const result = await createBed(1);
    expect(typeof result.success).toBe('boolean');
  });

  it('admitPatient retorna { success: boolean, error?: string } — nunca lança exceção', async () => {
    const result = await admitPatient(1, 'Teste');
    expect(typeof result.success).toBe('boolean');
    if (!result.success) expect(typeof result.error).toBe('string');
  });

  it('dischargePatient retorna { success: boolean, error?: string } — nunca lança exceção', async () => {
    const result = await dischargePatient(1);
    expect(typeof result.success).toBe('boolean');
    if (!result.success) expect(typeof result.error).toBe('string');
  });

  it('deleteBed retorna { success: boolean, error?: string } — nunca lança exceção', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeDbBed({ status: 'VACANT' }));
    (prismaMock.bed.delete as jest.Mock).mockRejectedValue(new Error('FK'));
    const result = await deleteBed(1);
    expect(typeof result.success).toBe('boolean');
    if (!result.success) expect(typeof result.error).toBe('string');
  });
});
