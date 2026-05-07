/**
 * Testes de Integração — patientData.ts (Nível 2 QA Strategy)
 *
 * Estratégia: PrismaClient mockado via jest-mock-extended com import type
 * do cliente gerado em @/app/generated/prisma/client (Prisma 6, saída customizada).
 *
 * Cobertura:
 *  - getBedDetails
 *  - getPatientFromBed
 *  - getLastEvolution
 *  - savePatientData
 */

import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '@/app/generated/prisma/client';

// ─── Mock do módulo Prisma ────────────────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import prismaImport from '@/lib/prisma';
const prismaMock = prismaImport as DeepMockProxy<PrismaClient>;

import {
  getBedDetails,
  getPatientFromBed,
  getLastEvolution,
  savePatientData,
} from '@/app/actions/patientData';

// ─── Fábricas de dados ────────────────────────────────────────────────────────
const makePatient = (overrides = {}) => ({
  id: 10,
  name: 'Ana Paula',
  birth_date: new Date('1975-08-12'),
  height: 162,
  weight: 65.0,
  gender: 'FEMALE' as const,
  commentary: 'Paciente diabética',
  arrival_date: new Date('2026-05-01'),
  admission_date: new Date('2026-05-01'),
  discharge_date: null,
  created_at: new Date('2026-05-01'),
  updated_at: new Date('2026-05-01'),
  ...overrides,
});

const makeBed = (overrides = {}) => ({
  id: 1,
  bed_number: 3,
  label: 'Leito 03',
  type: 'UTI Geral',
  status: 'OCCUPIED' as const,
  current_patient_id: 10,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
  ...overrides,
});

const makeEvolution = (overrides = {}) => ({
  id: 50,
  patient_id: 10,
  bed_id: 1,
  doctor_id: 1,
  patient_sex: null,
  patient_weight: 65.0,
  patient_height: 162,
  airway_type: 'fisiologica',
  respiratory_support: null,
  respiratory_spo2: '97',
  respiratory_sao2: null,
  respiratory_observation: null,
  respiratory_chest_xray: null,
  neurologic_sedation: null,
  neurologic_scales: 'GCS: 15',
  neurologic_pupils: 'Isocóricas 3mm',
  neurologic_bis: null,
  neurologic_pic: null,
  neurologic_enteral: null,
  neurologic_observation: null,
  hemodynamic_drugs: null,
  hemodynamic_pam: '80',
  hemodynamic_fc: '78',
  hemodynamic_rhythm: 'Sinusal',
  hemodynamic_enteral: null,
  hemodynamic_tec: null,
  hemodynamic_lactate: null,
  hemodynamic_svco2: null,
  hemodynamic_gapco2: null,
  hemodynamic_observation: null,
  renal_diuresis: '1200ml/24h',
  renal_diuretics: null,
  renal_balance: '-100ml',
  renal_dialysis: null,
  renal_glycemia: '110',
  renal_insulin: null,
  renal_observation: null,
  nutrition_support: 'Enteral',
  nutrition_residue: null,
  nutrition_prokinetics: null,
  nutrition_evacuation: null,
  nutrition_abdomen: 'RHA+',
  nutrition_surgical: false,
  nutrition_drains: null,
  nutrition_wound: null,
  hemato_antibiotics: null,
  hemato_cultures: null,
  hemato_temperature: '36.5',
  hemato_biomarkers: null,
  hemato_corticoid: null,
  hemato_observation: null,
  prophylaxis_tev: 'Enoxaparina 40mg',
  prophylaxis_ibp: 'Omeprazol 40mg',
  prophylaxis_others: null,
  generated_text: 'Paciente estável.',
  created_at: new Date('2026-05-07'),
  updated_at: new Date('2026-05-07'),
  ...overrides,
});

// ─── Reset entre testes ───────────────────────────────────────────────────────
beforeEach(() => {
  mockReset(prismaMock as any);
});

// ─── getBedDetails ────────────────────────────────────────────────────────────
describe('getBedDetails', () => {
  it('retorna leito com paciente e evoluções quando encontrado', async () => {
    const bedData = {
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [{ ...makeEvolution(), doctor: { name: 'Dr. Lima' } }],
      },
    };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bedData);

    const result = await getBedDetails(1);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(1);
    expect(prismaMock.bed.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        include: expect.objectContaining({ current_patient: expect.anything() }),
      })
    );
  });

  it('retorna null quando leito não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getBedDetails(999);

    expect(result).toBeNull();
  });

  it('retorna null quando Prisma lança exceção', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockRejectedValue(new Error('timeout'));

    const result = await getBedDetails(1);

    expect(result).toBeNull();
  });

  it('inclui evoluções com doctor.name via include aninhado', async () => {
    const bedData = {
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [
          { ...makeEvolution(), doctor: { name: 'Dra. Carla' } },
          { ...makeEvolution({ id: 51 }), doctor: { name: 'Dr. Pedro' } },
        ],
      },
    };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bedData);

    const result = await getBedDetails(1) as any;

    expect(result.current_patient.evolutions).toHaveLength(2);
    expect(result.current_patient.evolutions[0].doctor.name).toBe('Dra. Carla');
  });

  it('retorna leito sem paciente quando está vago', async () => {
    const vacantBed = { ...makeBed({ status: 'VACANT', current_patient_id: null }), current_patient: null };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(vacantBed);

    const result = await getBedDetails(1) as any;

    expect(result.current_patient).toBeNull();
  });
});

// ─── getPatientFromBed ────────────────────────────────────────────────────────
describe('getPatientFromBed', () => {
  it('retorna sucesso com patient e bedLabel quando leito tem paciente', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient(),
    });

    const result = await getPatientFromBed(1);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.patient.id).toBe(10);
      expect(result.patient.name).toBe('Ana Paula');
      expect(result.bedLabel).toBe('Leito 03');
    }
  });

  it('retorna erro quando leito está vazio', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed({ current_patient_id: null }),
      current_patient: null,
    });

    const result = await getPatientFromBed(1);

    expect(result.success).toBe(false);
    expect((result as any).error).toBeDefined();
  });

  it('retorna erro quando leito não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getPatientFromBed(999);

    expect(result.success).toBe(false);
  });

  it('retorna erro quando Prisma lança exceção', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockRejectedValue(new Error('network error'));

    const result = await getPatientFromBed(1);

    expect(result.success).toBe(false);
    expect((result as any).error).toBe('Erro de conexão');
  });

  it('usa fallback "Leito {bed_number}" quando label é null', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed({ label: null, bed_number: 7 }),
      current_patient: makePatient(),
    });

    const result = await getPatientFromBed(1);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.bedLabel).toBe('Leito 7');
    }
  });

  it('chama findUnique com include: { current_patient: true }', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient(),
    });

    await getPatientFromBed(1);

    expect(prismaMock.bed.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        include: { current_patient: true },
      })
    );
  });
});

// ─── getLastEvolution ─────────────────────────────────────────────────────────
describe('getLastEvolution', () => {
  it('retorna a evolução mais recente do paciente', async () => {
    const evo = makeEvolution();
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockResolvedValue(evo);

    const result = await getLastEvolution(10);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(50);
  });

  it('chama findFirst com patient_id e orderBy created_at desc', async () => {
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockResolvedValue(makeEvolution());

    await getLastEvolution(10);

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

  it('retorna null quando Prisma lança exceção', async () => {
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await getLastEvolution(10);

    expect(result).toBeNull();
  });
});

// ─── savePatientData ──────────────────────────────────────────────────────────
describe('savePatientData', () => {
  const validData = {
    name: 'Ana Paula',
    height: '162',
    gender: 'FEMALE',
    birth_date: '1975-08-12',
    arrival_date: '2026-05-01',
    commentary: 'Diabética',
  };

  it('atualiza paciente com sucesso', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient());

    const result = await savePatientData(1, validData);

    expect(result.success).toBe(true);
    expect(prismaMock.patient.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 10 } })
    );
  });

  it('retorna erro quando leito não existe', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await savePatientData(999, validData);

    expect(result.success).toBe(false);
    expect(prismaMock.patient.update).not.toHaveBeenCalled();
  });

  it('retorna erro quando leito não tem paciente vinculado', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(
      makeBed({ current_patient_id: null })
    );

    const result = await savePatientData(1, validData);

    expect(result.success).toBe(false);
    expect(prismaMock.patient.update).not.toHaveBeenCalled();
  });

  it('converte height string para number antes de salvar', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, validData);

    expect(typeof savedData.height).toBe('number');
    expect(savedData.height).toBe(162);
  });

  it('converte birth_date string para Date antes de salvar', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, validData);

    expect(savedData.birth_date).toBeInstanceOf(Date);
  });

  it('height vazia (\'\') é convertida para null', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, { ...validData, height: '' });

    expect(savedData.height).toBeNull();
  });

  it('retorna erro quando Prisma lança exceção', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockRejectedValue(new Error('constraint violation'));

    const result = await savePatientData(1, validData);

    expect(result.success).toBe(false);
    expect((result as any).error).toBeDefined();
  });

  it('chama revalidatePath após atualização bem-sucedida', async () => {
    const { revalidatePath } = jest.requireMock('next/cache');
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient());

    await savePatientData(1, validData);

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/1');
  });
});
