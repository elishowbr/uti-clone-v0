/**
 * Testes de Integração — bedManagement.ts
 * 
 * Estratégia: Prisma Client é mockado via jest-mock-extended (mockDeep).
 * Cada teste isola chamadas ao banco sem precisar de conexão real.
 * 
 * Cobertura:
 *  - getDashboardData
 *  - createBed
 *  - admitPatient
 *  - dischargePatient
 *  - finishCleaning
 *  - setBedToCleaning
 *  - deleteBed
 */

import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// ─── Mock do módulo Prisma (factory function evita hoisting issue) ────────────
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Importar o mock após o jest.mock para obter a referência
import prismaImport from '@/lib/prisma';
const prismaMock = prismaImport as DeepMockProxy<PrismaClient>;

// Mock de next/cache (não existe no ambiente de teste)
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// ─── Import das actions (APÓS o mock) ────────────────────────────────────────
import {
  getDashboardData,
  createBed,
  admitPatient,
  dischargePatient,
  finishCleaning,
  setBedToCleaning,
  deleteBed,
} from '@/app/actions/bedManagement';

// ─── Fábrica de dados ─────────────────────────────────────────────────────────
const makeBed = (overrides = {}) => ({
  id: 1,
  bed_number: 1,
  label: 'Leito 01',
  type: 'UTI Geral',
  status: 'VACANT' as const,
  current_patient_id: null,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
  ...overrides,
});

const makePatient = (overrides = {}) => ({
  id: 10,
  name: 'Maria Silva',
  birth_date: null,
  height: null,
  weight: null,
  gender: null,
  commentary: null,
  arrival_date: null,
  admission_date: new Date('2026-01-01'),
  discharge_date: null,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
  ...overrides,
});

// ─── Reset entre testes ───────────────────────────────────────────────────────
beforeEach(() => {
  mockReset(prismaMock as any);
});

// ─── getDashboardData ─────────────────────────────────────────────────────────
describe('getDashboardData', () => {
  it('retorna lista de leitos com paciente e última evolução', async () => {
    const beds = [
      {
        ...makeBed({ status: 'OCCUPIED' }),
        current_patient: makePatient(),
        clinical_evolutions: [
          { created_at: new Date('2026-04-30'), generated_text: 'Evolução de teste' },
        ],
      },
    ];

    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue(beds);

    const result = await getDashboardData();

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('OCCUPIED');
    expect(result[0].current_patient?.name).toBe('Maria Silva');
    expect(prismaMock.bed.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { bed_number: 'asc' },
        include: expect.objectContaining({ current_patient: true }),
      })
    );
  });

  it('retorna array vazio quando não há leitos', async () => {
    (prismaMock.bed.findMany as jest.Mock).mockResolvedValue([]);
    const result = await getDashboardData();
    expect(result).toEqual([]);
  });
});

// ─── createBed ────────────────────────────────────────────────────────────────
describe('createBed', () => {
  it('cria leito com sucesso quando número não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockResolvedValue(makeBed());

    const result = await createBed(1);

    expect(result.success).toBe(true);
    expect(prismaMock.bed.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bed_number: 1,
          label: 'Leito 01',
          status: 'VACANT',
        }),
      })
    );
  });

  it('retorna erro quando número de leito já existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());

    const result = await createBed(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Número de leito já existe');
    expect(prismaMock.bed.create).not.toHaveBeenCalled();
  });

  it('formata label corretamente para leito com número < 10', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockResolvedValue(makeBed({ bed_number: 5, label: 'Leito 05' }));

    await createBed(5);

    expect(prismaMock.bed.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ label: 'Leito 05' }),
      })
    );
  });

  it('formata label corretamente para leito com número >= 10', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockResolvedValue(makeBed({ bed_number: 12, label: 'Leito 12' }));

    await createBed(12);

    expect(prismaMock.bed.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ label: 'Leito 12' }),
      })
    );
  });

  it('retorna erro quando Prisma lança exceção', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.bed.create as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

    const result = await createBed(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao criar leito');
  });
});

// ─── admitPatient ─────────────────────────────────────────────────────────────
describe('admitPatient', () => {
  it('admite paciente com sucesso via transação', async () => {
    const newPatient = makePatient({ id: 20, name: 'João Pereira' });

    // Simula o callback da $transaction
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
      const tx = {
        patient: { create: jest.fn().mockResolvedValue(newPatient) },
        bed: { update: jest.fn().mockResolvedValue(makeBed({ status: 'OCCUPIED' })) },
      };
      await callback(tx);
    });

    const result = await admitPatient(1, 'João Pereira');

    expect(result.success).toBe(true);
  });

  it('retorna erro quando a transação falha', async () => {
    (prismaMock.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

    const result = await admitPatient(1, 'João Pereira');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Falha ao admitir paciente');
  });

  it('cria paciente com admission_date definida', async () => {
    let patientCreateData: any;

    (prismaMock.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
      const tx = {
        patient: {
          create: jest.fn().mockImplementation((args: any) => {
            patientCreateData = args.data;
            return Promise.resolve(makePatient());
          }),
        },
        bed: { update: jest.fn().mockResolvedValue({}) },
      };
      await callback(tx);
    });

    await admitPatient(1, 'Teste Admissão');

    expect(patientCreateData).toBeDefined();
    expect(patientCreateData.name).toBe('Teste Admissão');
    expect(patientCreateData.admission_date).toBeInstanceOf(Date);
  });
});

// ─── dischargePatient ─────────────────────────────────────────────────────────
describe('dischargePatient', () => {
  it('dá alta ao paciente e envia leito para limpeza', async () => {
    const bedWithPatient = makeBed({ status: 'OCCUPIED', current_patient_id: 10 });

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bedWithPatient);
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
      const tx = {
        patient: { update: jest.fn().mockResolvedValue({}) },
        bed: { update: jest.fn().mockResolvedValue({}) },
      };
      await callback(tx);
    });

    const result = await dischargePatient(1);

    expect(result.success).toBe(true);
  });

  it('retorna erro quando leito não é encontrado', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await dischargePatient(999);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Leito não encontrado');
  });

  it('processa alta mesmo quando leito não tem paciente vinculado', async () => {
    const bedWithoutPatient = makeBed({ current_patient_id: null });

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bedWithoutPatient);

    let patientUpdateCalled = false;
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
      const tx = {
        patient: {
          update: jest.fn().mockImplementation(() => {
            patientUpdateCalled = true;
            return Promise.resolve({});
          }),
        },
        bed: { update: jest.fn().mockResolvedValue({}) },
      };
      await callback(tx);
    });

    const result = await dischargePatient(1);

    // Sem paciente vinculado, não deve atualizar o paciente
    expect(patientUpdateCalled).toBe(false);
    expect(result.success).toBe(true);
  });

  it('define discharge_date ao dar alta', async () => {
    const bedWithPatient = makeBed({ current_patient_id: 10 });
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bedWithPatient);

    let patientUpdateData: any;
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
      const tx = {
        patient: {
          update: jest.fn().mockImplementation((args: any) => {
            patientUpdateData = args.data;
            return Promise.resolve({});
          }),
        },
        bed: { update: jest.fn().mockResolvedValue({}) },
      };
      await callback(tx);
    });

    await dischargePatient(1);

    expect(patientUpdateData.discharge_date).toBeInstanceOf(Date);
  });
});

// ─── finishCleaning ───────────────────────────────────────────────────────────
describe('finishCleaning', () => {
  it('muda status do leito para VACANT', async () => {
    (prismaMock.bed.update as jest.Mock).mockResolvedValue(makeBed({ status: 'VACANT' }));

    const result = await finishCleaning(1);

    expect(result.success).toBe(true);
    expect(prismaMock.bed.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'VACANT' },
    });
  });

  it('retorna erro quando Prisma falha', async () => {
    (prismaMock.bed.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await finishCleaning(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao liberar leito');
  });
});

// ─── setBedToCleaning ─────────────────────────────────────────────────────────
describe('setBedToCleaning', () => {
  it('envia leito para limpeza e limpa current_patient_id', async () => {
    (prismaMock.bed.update as jest.Mock).mockResolvedValue(makeBed({ status: 'CLEANING' }));

    const result = await setBedToCleaning(1);

    expect(result.success).toBe(true);
    expect(prismaMock.bed.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'CLEANING',
        current_patient_id: null,
      },
    });
  });

  it('retorna erro quando Prisma falha', async () => {
    (prismaMock.bed.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await setBedToCleaning(1);

    expect(result.success).toBe(false);
  });
});

// ─── deleteBed ────────────────────────────────────────────────────────────────
describe('deleteBed', () => {
  it('deleta leito vago com sucesso', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed({ status: 'VACANT' }));
    (prismaMock.bed.delete as jest.Mock).mockResolvedValue({});

    const result = await deleteBed(1);

    expect(result.success).toBe(true);
    expect(prismaMock.bed.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('bloqueia deleção de leito OCUPADO', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed({ status: 'OCCUPIED' }));

    const result = await deleteBed(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Não é possível excluir um leito ocupado.');
    expect(prismaMock.bed.delete).not.toHaveBeenCalled();
  });

  it('retorna erro quando leito não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await deleteBed(999);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Leito não encontrado');
  });

  it('retorna erro quando deleção falha por FK (histórico clínico)', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed({ status: 'VACANT' }));
    (prismaMock.bed.delete as jest.Mock).mockRejectedValue(
      new Error('Foreign key constraint failed')
    );

    const result = await deleteBed(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao excluir. O leito pode ter histórico clínico vinculado.');
  });

  it('permite deletar leito em limpeza', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed({ status: 'CLEANING' }));
    (prismaMock.bed.delete as jest.Mock).mockResolvedValue({});

    const result = await deleteBed(1);

    expect(result.success).toBe(true);
  });
});