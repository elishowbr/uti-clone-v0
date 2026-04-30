/**
 * Testes de Integração — patientData.ts
 * 
 * Cobertura:
 *  - getBedDetails
 *  - getPatientFromBed
 *  - getLastEvolution
 *  - savePatientData
 */

import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// ─── Mock do Prisma (factory function evita hoisting issue) ──────────────────
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import prismaImport from '@/lib/prisma';
const prismaMock = prismaImport as DeepMockProxy<PrismaClient>;

// ─── Import das actions ───────────────────────────────────────────────────────
import {
  getBedDetails,
  getPatientFromBed,
  getLastEvolution,
  savePatientData,
} from '@/app/actions/patientData';

// ─── Fábrica de dados ─────────────────────────────────────────────────────────
const makePatient = (overrides = {}) => ({
  id: 10,
  name: 'Maria Silva',
  birth_date: new Date('1960-05-15'),
  height: 165,
  weight: 68.5,
  gender: 'FEMALE' as const,
  commentary: null,
  arrival_date: null,
  admission_date: new Date('2026-04-01'),
  discharge_date: null,
  created_at: new Date('2026-04-01'),
  updated_at: new Date('2026-04-01'),
  ...overrides,
});

const makeBed = (overrides = {}) => ({
  id: 1,
  bed_number: 1,
  label: 'Leito 01',
  type: 'UTI Geral',
  status: 'OCCUPIED' as const,
  current_patient_id: 10,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
  ...overrides,
});

const makeEvolution = (overrides = {}) => ({
  id: 100,
  patient_id: 10,
  bed_id: 1,
  doctor_id: 1,
  patient_sex: 'FEMALE' as const,
  patient_weight: 68.5,
  patient_height: 165,
  airway_type: 'fisiologica',
  respiratory_support: null,
  respiratory_spo2: '98',
  respiratory_sao2: null,
  respiratory_observation: null,
  respiratory_chest_xray: null,
  neurologic_sedation: null,
  neurologic_scales: 'GCS: 15',
  neurologic_pupils: null,
  neurologic_bis: null,
  neurologic_pic: null,
  neurologic_enteral: null,
  neurologic_observation: null,
  hemodynamic_drugs: null,
  hemodynamic_pam: '75',
  hemodynamic_fc: '80',
  hemodynamic_rhythm: 'Sinusal',
  hemodynamic_enteral: null,
  hemodynamic_tec: null,
  hemodynamic_lactate: null,
  hemodynamic_svco2: null,
  hemodynamic_gapco2: null,
  hemodynamic_observation: null,
  renal_diuresis: null,
  renal_diuretics: null,
  renal_balance: null,
  renal_dialysis: null,
  renal_glycemia: null,
  renal_insulin: null,
  renal_observation: null,
  nutrition_support: null,
  nutrition_residue: null,
  nutrition_prokinetics: null,
  nutrition_evacuation: null,
  nutrition_abdomen: null,
  nutrition_surgical: false,
  nutrition_drains: null,
  nutrition_wound: null,
  hemato_antibiotics: null,
  hemato_cultures: null,
  hemato_temperature: null,
  hemato_biomarkers: null,
  hemato_corticoid: null,
  hemato_observation: null,
  prophylaxis_tev: null,
  prophylaxis_ibp: null,
  prophylaxis_others: null,
  generated_text: 'Evolução gerada automaticamente',
  created_at: new Date('2026-04-30'),
  updated_at: new Date('2026-04-30'),
  ...overrides,
});

// ─── Reset entre testes ───────────────────────────────────────────────────────
beforeEach(() => {
  mockReset(prismaMock as any);
});

// ─── getBedDetails ────────────────────────────────────────────────────────────
describe('getBedDetails', () => {
  it('retorna detalhes do leito com paciente e evoluções', async () => {
    const patient = {
      ...makePatient(),
      evolutions: [
        { ...makeEvolution(), doctor: { name: 'Dr. João' } },
      ],
    };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: patient,
    });

    const result = await getBedDetails(1);

    expect(result).not.toBeNull();
    expect(result?.current_patient?.name).toBe('Maria Silva');
    expect(result?.current_patient?.evolutions).toHaveLength(1);
    expect(result?.current_patient?.evolutions[0].doctor.name).toBe('Dr. João');
  });

  it('retorna null quando leito não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await getBedDetails(999);
    expect(result).toBeNull();
  });

  it('retorna null quando Prisma lança erro', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockRejectedValue(new Error('Connection error'));
    const result = await getBedDetails(1);
    expect(result).toBeNull();
  });

  it('busca com include correto para evoluções ordenadas desc', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());

    await getBedDetails(1);

    expect(prismaMock.bed.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        include: expect.objectContaining({
          current_patient: expect.objectContaining({
            include: expect.objectContaining({
              evolutions: expect.objectContaining({
                orderBy: { created_at: 'desc' },
              }),
            }),
          }),
        }),
      })
    );
  });
});

// ─── getPatientFromBed ────────────────────────────────────────────────────────
describe('getPatientFromBed', () => {
  it('retorna paciente e label do leito quando leito está ocupado', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient(),
    });

    const result = await getPatientFromBed(1);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.patient?.name).toBe('Maria Silva');
      expect(result.bedLabel).toBe('Leito 01');
    }
  });

  it('retorna fallback de label quando leito não tem label definida', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed({ label: null }),
      current_patient: makePatient(),
    });

    const result = await getPatientFromBed(1);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.bedLabel).toBe('Leito 1');
    }
  });

  it('retorna erro quando leito está vazio', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed({ current_patient_id: null }),
      current_patient: null,
    });

    const result = await getPatientFromBed(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Leito vazio ou não encontrado');
  });

  it('retorna erro quando leito não existe no banco', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await getPatientFromBed(999);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Leito vazio ou não encontrado');
  });

  it('retorna erro de conexão quando Prisma lança exceção', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockRejectedValue(new Error('Timeout'));
    const result = await getPatientFromBed(1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro de conexão');
  });
});

// ─── getLastEvolution ─────────────────────────────────────────────────────────
describe('getLastEvolution', () => {
  it('retorna a evolução mais recente do paciente', async () => {
    const evo = makeEvolution();
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockResolvedValue(evo);

    const result = await getLastEvolution(10);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(100);
    expect(prismaMock.clinicalEvolution.findFirst).toHaveBeenCalledWith({
      where: { patient_id: 10 },
      orderBy: { created_at: 'desc' },
    });
  });

  it('retorna null quando paciente não tem evoluções', async () => {
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockResolvedValue(null);
    const result = await getLastEvolution(10);
    expect(result).toBeNull();
  });

  it('retorna null quando Prisma lança erro', async () => {
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));
    const result = await getLastEvolution(10);
    expect(result).toBeNull();
  });
});

// ─── savePatientData ──────────────────────────────────────────────────────────
describe('savePatientData', () => {
  const validData = {
    name: 'Maria Atualizada',
    height: '168',
    gender: 'FEMALE',
    birth_date: '1960-05-15',
    arrival_date: '2026-04-01',
    commentary: 'Paciente hipertensa',
  };

  it('salva dados do paciente com sucesso', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient({ name: 'Maria Atualizada' }));

    const result = await savePatientData(1, validData);

    expect(result.success).toBe(true);
    expect(prismaMock.patient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ name: 'Maria Atualizada' }),
      })
    );
  });

  it('converte height para Number no update', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient());

    await savePatientData(1, validData);

    expect(prismaMock.patient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ height: 168 }),
      })
    );
  });

  it('salva height como null quando não informado', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient());

    await savePatientData(1, { ...validData, height: '' });

    expect(prismaMock.patient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ height: null }),
      })
    );
  });

  it('converte birth_date para Date no update', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient());

    await savePatientData(1, validData);

    const call = (prismaMock.patient.update as jest.Mock).mock.calls[0][0];
    expect(call.data.birth_date).toBeInstanceOf(Date);
  });

  it('salva birth_date como null quando não informado', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient());

    await savePatientData(1, { ...validData, birth_date: '' });

    expect(prismaMock.patient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ birth_date: null }),
      })
    );
  });

  it('retorna erro quando leito não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await savePatientData(999, validData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Leito vazio ou não encontrado');
  });

  it('retorna erro quando leito está vazio (sem current_patient_id)', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(
      makeBed({ current_patient_id: null })
    );
    const result = await savePatientData(1, validData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Leito vazio ou não encontrado');
  });

  it('retorna erro quando update do Prisma falha', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockRejectedValue(new Error('Constraint error'));
    const result = await savePatientData(1, validData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao salvar dados');
  });

  it('retorna o paciente atualizado no resultado', async () => {
    const updatedPatient = makePatient({ name: 'Maria Atualizada', height: 168 });
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(updatedPatient);

    const result = await savePatientData(1, validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.patient?.name).toBe('Maria Atualizada');
    }
  });
}); 