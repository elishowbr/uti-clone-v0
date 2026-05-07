/**
 * Testes de Contrato — patientData.ts (Nível 3 QA Strategy)
 *
 * Objetivo: garantir sincronismo de shapes/tipos entre os consumidores
 * (BedDetailsPage, PatientEditModal) e o provedor (Server Actions de patientData).
 *
 * Contratos cobertos:
 *  C1 — getBedDetails   → BedDetailsPage (lista de evoluções, dados do paciente)
 *  C2 — getPatientFromBed → PatientEditModal (campos de edição de paciente)
 *  C3 — getLastEvolution  → EvolutionPage (pre-fill de formulário)
 *  C4 — savePatientData   → PatientEditModal (input → coerção de tipos → resposta)
 *  C5 — Contrato de enum Sex (MALE | FEMALE | OTHER)
 *  C6 — Contrato de tipo de datas (sempre Date, nunca string)
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
  getBedDetails,
  getPatientFromBed,
  getLastEvolution,
  savePatientData,
} from '@/app/actions/patientData';

// ─── Interfaces que representam o contrato esperado pelo consumidor ───────────

/** Shape que BedDetailsPage espera de getBedDetails */
interface BedDetailsContract {
  id: number;
  bed_number: number;
  label: string | null;
  status: string;
  current_patient: {
    id: number;
    name: string;
    birth_date: Date | null;
    admission_date: Date;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    height: number | null;
    weight: number | null;
    commentary: string | null;
    evolutions: Array<{
      id: number;
      created_at: Date;
      generated_text: string | null;
      doctor: { name: string };
    }>;
  } | null;
}

/** Shape que PatientEditModal espera de getPatientFromBed (caso sucesso) */
interface GetPatientSuccessContract {
  success: true;
  patient: {
    id: number;
    name: string;
    birth_date: Date | null;
    height: number | null;
    weight: number | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    commentary: string | null;
    arrival_date: Date | null;
    admission_date: Date;
  };
  bedLabel: string;
}

interface GetPatientErrorContract {
  success: false;
  error: string;
}

// ─── Fábricas ─────────────────────────────────────────────────────────────────

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
  patient_sex: 'FEMALE' as const,
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
  generated_text: 'Paciente estável, sem intercorrências.',
  created_at: new Date('2026-05-07'),
  updated_at: new Date('2026-05-07'),
  ...overrides,
});

beforeEach(() => mockReset(prismaMock as any));

// ─── C1: getBedDetails → BedDetailsPage ──────────────────────────────────────
describe('C1 — Contrato: getBedDetails → BedDetailsPage', () => {
  it('retorna null quando leito não existe — consumidor deve redirecionar', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getBedDetails(999);

    // Contrato: valor null é válido (leito inexistente)
    expect(result).toBeNull();
  });

  it('retorna null quando Prisma lança erro — consumidor não quebra', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockRejectedValue(new Error('timeout'));

    const result = await getBedDetails(1);
    expect(result).toBeNull();
  });

  it('shape do leito tem todos os campos obrigatórios do contrato', async () => {
    const bed: BedDetailsContract = {
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [{ ...makeEvolution(), doctor: { name: 'Dr. Lima' } }],
      },
    };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bed);
    const result = await getBedDetails(1) as BedDetailsContract;

    // Campos obrigatórios do leito
    expect(typeof result.id).toBe('number');
    expect(typeof result.bed_number).toBe('number');
    expect(typeof result.status).toBe('string');

    // Paciente aninhado
    expect(result.current_patient).not.toBeNull();
    expect(typeof result.current_patient!.id).toBe('number');
    expect(typeof result.current_patient!.name).toBe('string');
    expect(result.current_patient!.admission_date).toBeInstanceOf(Date);
  });

  it('evoluções têm created_at como Date — consumidor formata com toLocaleDateString()', async () => {
    const bed = {
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [{ ...makeEvolution(), doctor: { name: 'Dr. Lima' } }],
      },
    };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bed);
    const result = await getBedDetails(1) as BedDetailsContract;

    const evo = result.current_patient!.evolutions[0];

    // Contrato crítico: consumidor chama toLocaleDateString() — precisa ser Date
    expect(evo.created_at).toBeInstanceOf(Date);
    expect(() => evo.created_at.toLocaleDateString()).not.toThrow();
  });

  it('doctor.name é string — consumidor exibe "Dr(a). {nome}"', async () => {
    const bed = {
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [{ ...makeEvolution(), doctor: { name: 'Carla Mendes' } }],
      },
    };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bed);
    const result = await getBedDetails(1) as BedDetailsContract;

    const doctorName = result.current_patient!.evolutions[0].doctor.name;
    expect(typeof doctorName).toBe('string');
    expect(doctorName).toBe('Carla Mendes');
  });

  it('generated_text pode ser string ou null — consumidor usa fallback "Sem resumo disponível"', async () => {
    const bed = {
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [{ ...makeEvolution({ generated_text: null }), doctor: { name: 'Dr. Lima' } }],
      },
    };

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(bed);
    const result = await getBedDetails(1) as BedDetailsContract;

    const generatedText = result.current_patient!.evolutions[0].generated_text;
    // Contrato: null é válido; consumidor usa fallback
    expect(generatedText === null || typeof generatedText === 'string').toBe(true);
  });
});

// ─── C2: getPatientFromBed → PatientEditModal ─────────────────────────────────
describe('C2 — Contrato: getPatientFromBed → PatientEditModal', () => {
  it('shape de sucesso tem { success: true, patient, bedLabel }', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient(),
    });

    const result = await getPatientFromBed(1) as GetPatientSuccessContract;

    // Discriminador
    expect(result.success).toBe(true);

    // bedLabel é string — consumidor exibe no cabeçalho do modal
    expect(typeof result.bedLabel).toBe('string');
    expect(result.bedLabel.length).toBeGreaterThan(0);

    // patient tem campos que o modal preenche nos inputs
    const p = result.patient;
    expect(typeof p.id).toBe('number');
    expect(typeof p.name).toBe('string');
  });

  it('patient.birth_date é Date ou null — consumidor converte para input[type=date]', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient(),
    });

    const result = await getPatientFromBed(1) as GetPatientSuccessContract;

    const birthDate = result.patient.birth_date;
    expect(birthDate instanceof Date || birthDate === null).toBe(true);
    // Se for Date, deve ser válida (não NaN)
    if (birthDate !== null) {
      expect(isNaN(birthDate.getTime())).toBe(false);
    }
  });

  it('patient.height é number ou null — consumidor preenche input numérico', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient({ height: 162 }),
    });

    const result = await getPatientFromBed(1) as GetPatientSuccessContract;

    const height = result.patient.height;
    expect(height === null || typeof height === 'number').toBe(true);
  });

  it('patient.gender é um dos valores válidos do enum Sex ou null', async () => {
    const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER', null];

    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient({ gender: 'FEMALE' }),
    });

    const result = await getPatientFromBed(1) as GetPatientSuccessContract;
    expect(VALID_GENDERS).toContain(result.patient.gender);
  });

  it('bedLabel usa fallback "Leito {bed_number}" quando label é null', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed({ label: null, bed_number: 7 }),
      current_patient: makePatient(),
    });

    const result = await getPatientFromBed(1) as GetPatientSuccessContract;

    expect(result.success).toBe(true);
    // Contrato: fallback deve ser "Leito 7"
    expect(result.bedLabel).toBe('Leito 7');
  });

  it('shape de erro tem { success: false, error: string } para leito vazio', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed({ current_patient_id: null }),
      current_patient: null,
    });

    const result = await getPatientFromBed(1) as GetPatientErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('shape de erro tem { success: false, error: string } para exceção de banco', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockRejectedValue(new Error('network'));

    const result = await getPatientFromBed(1) as GetPatientErrorContract;

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});

// ─── C3: getLastEvolution → EvolutionPage (pre-fill) ─────────────────────────
describe('C3 — Contrato: getLastEvolution → EvolutionPage (pre-fill)', () => {
  it('retorna evolução com campos numéricos como number — consumidor pre-preenche sliders', async () => {
    const evo = makeEvolution();
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockResolvedValue(evo);

    const result = await getLastEvolution(10);

    expect(result).not.toBeNull();
    // Contrato: campos numéricos são number (usados em parseFloat pelo consumidor)
    expect(typeof result!.patient_height === 'number' || result!.patient_height === null).toBe(true);
    expect(typeof result!.patient_weight === 'number' || result!.patient_weight === null).toBe(true);
  });

  it('retorna evolução com campos de texto como string ou null — consumidor faz fallback ""', async () => {
    const evo = makeEvolution();
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockResolvedValue(evo);

    const result = await getLastEvolution(10);

    // Contrato: campos de texto são string ou null (nunca undefined)
    const textFields = [
      result!.airway_type, result!.respiratory_spo2, result!.neurologic_scales,
      result!.hemodynamic_pam, result!.hemodynamic_fc, result!.hemodynamic_rhythm,
      result!.renal_diuresis, result!.hemato_temperature,
      result!.prophylaxis_tev, result!.prophylaxis_ibp,
    ];
    textFields.forEach(field => {
      expect(typeof field === 'string' || field === null).toBe(true);
    });
  });

  it('retorna null quando não há evoluções — consumidor não pre-preenche', async () => {
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await getLastEvolution(10);
    expect(result).toBeNull();
  });

  it('retorna null em caso de erro — consumidor usa valores padrão do formulário', async () => {
    (prismaMock.clinicalEvolution.findFirst as jest.Mock).mockRejectedValue(new Error('timeout'));

    const result = await getLastEvolution(10);
    expect(result).toBeNull();
  });
});

// ─── C4: savePatientData → PatientEditModal (coerção de tipos) ────────────────
describe('C4 — Contrato: savePatientData (input do modal → coerções → resposta)', () => {
  const modalInput = {
    name: 'Ana Paula',
    height: '162',       // string vindo do input[type=text]
    gender: 'FEMALE',
    birth_date: '1975-08-12',   // string vindo do input[type=date]
    arrival_date: '2026-05-01', // string vindo do input[type=date]
    commentary: 'Diabética',
  };

  it('height string é convertido para number antes de salvar — contrato de tipo', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, modalInput);

    // Contrato: height deve chegar ao Prisma como number, não string
    expect(typeof savedData.height).toBe('number');
    expect(savedData.height).toBe(162);
  });

  it('birth_date string é convertida para Date antes de salvar — contrato de tipo', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, modalInput);

    // Contrato: datas chegam ao Prisma como Date, nunca como string ISO
    expect(savedData.birth_date).toBeInstanceOf(Date);
    expect(isNaN(savedData.birth_date.getTime())).toBe(false);
  });

  it('arrival_date string é convertida para Date antes de salvar', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, modalInput);

    expect(savedData.arrival_date).toBeInstanceOf(Date);
  });

  it('height "" (vazio) é convertido para null — consumidor pode enviar campo vazio', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, { ...modalInput, height: '' });

    expect(savedData.height).toBeNull();
  });

  it('birth_date "" (vazio) é convertido para null', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    let savedData: any = null;
    (prismaMock.patient.update as jest.Mock).mockImplementation(({ data }) => {
      savedData = data;
      return Promise.resolve(makePatient());
    });

    await savePatientData(1, { ...modalInput, birth_date: '' });

    expect(savedData.birth_date).toBeNull();
  });

  it('resposta de sucesso tem { success: true, patient } — modal usa patient para atualizar UI', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(makeBed());
    (prismaMock.patient.update as jest.Mock).mockResolvedValue(makePatient());

    const result = await savePatientData(1, modalInput);

    expect(result.success).toBe(true);
    // Contrato: patient está presente no retorno de sucesso
    if (result.success) {
      expect(result.patient).toBeDefined();
      expect(typeof result.patient!.id).toBe('number');
      expect(typeof result.patient!.name).toBe('string');
    }
  });

  it('resposta de erro tem { success: false, error: string } — modal exibe mensagem ao usuário', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await savePatientData(999, modalInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

// ─── C5: Contrato de enum Sex ─────────────────────────────────────────────────
describe('C5 — Contrato de enum: Sex (MALE | FEMALE | OTHER)', () => {
  const VALID_GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

  it.each(VALID_GENDERS)(
    'gender "%s" retornado pelo Prisma é passado intacto ao consumidor',
    async (gender) => {
      (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
        ...makeBed(),
        current_patient: makePatient({ gender }),
      });

      const result = await getPatientFromBed(1) as GetPatientSuccessContract;

      expect(result.success).toBe(true);
      expect(VALID_GENDERS).toContain(result.patient.gender);
      expect(result.patient.gender).toBe(gender);
    }
  );

  it('gender null é aceito — paciente sem gênero definido', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: makePatient({ gender: null }),
    });

    const result = await getPatientFromBed(1) as GetPatientSuccessContract;
    expect(result.success).toBe(true);
    expect(result.patient.gender).toBeNull();
  });
});

// ─── C6: Contrato de tipo de datas (Date, nunca string) ──────────────────────
describe('C6 — Contrato de tipo: datas são sempre Date, nunca string ISO', () => {
  it('admission_date retornada por getBedDetails é instância de Date', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [],
      },
    });

    const result = await getBedDetails(1) as BedDetailsContract;

    expect(result.current_patient!.admission_date).toBeInstanceOf(Date);
    // Deve poder chamar toLocaleDateString sem erro
    expect(() => result.current_patient!.admission_date.toLocaleDateString()).not.toThrow();
  });

  it('birth_date retornada por getBedDetails é instância de Date (quando definida)', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: {
        ...makePatient({ birth_date: new Date('1975-08-12') }),
        evolutions: [],
      },
    });

    const result = await getBedDetails(1) as BedDetailsContract;

    const birthDate = result.current_patient!.birth_date;
    if (birthDate !== null) {
      expect(birthDate).toBeInstanceOf(Date);
    }
  });

  it('created_at de evolução é instância de Date — consumidor usa toLocaleDateString()', async () => {
    (prismaMock.bed.findUnique as jest.Mock).mockResolvedValue({
      ...makeBed(),
      current_patient: {
        ...makePatient(),
        evolutions: [{ ...makeEvolution(), doctor: { name: 'Dr. Test' } }],
      },
    });

    const result = await getBedDetails(1) as BedDetailsContract;
    const evoDate = result.current_patient!.evolutions[0].created_at;

    expect(evoDate).toBeInstanceOf(Date);
    expect(() => evoDate.toLocaleDateString()).not.toThrow();
    expect(() => evoDate.toLocaleTimeString()).not.toThrow();
  });
});
