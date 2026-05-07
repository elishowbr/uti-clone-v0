/**
 * Testes de Contrato — saveEvolution.ts (Nível 3 QA Strategy)
 *
 * Objetivo: garantir sincronismo entre os tipos das interfaces dos formulários
 * (consumidor: EvolutionPage) e o mapeamento para campos do banco de dados
 * (provedor: saveEvolution Server Action + schema Prisma).
 *
 * Contratos cobertos:
 *  C1 — RespiratoryData  → campos respiratory_* do schema
 *  C2 — NeurologicalData → campos neurologic_* do schema
 *  C3 — HemodynamicsData → campos hemodynamic_* do schema
 *  C4 — RenalData        → campos renal_* do schema
 *  C5 — HematoinfectiousData → campos hemato_* do schema
 *  C6 — ProphylaxisData  → campos prophylaxis_* do schema
 *  C7 — NutritionData    → campos nutrition_* do schema (lógica de concatenação)
 *  C8 — GeneralData      → patient_height / patient_weight (coerção string → number)
 *  C9 — Resposta de sucesso e erro — shape consistente para o consumidor
 *  C10 — Contrato de geração de texto: generatedText presente → não chama generateEvolutionText
 */

import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '@/app/generated/prisma/client';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

jest.mock(
  '@/app/dashboard/[bedId]/evolution/utils/generateEvolutionText',
  () => ({ generateEvolutionText: jest.fn(() => 'TEXTO_GERADO_AUTOMATICAMENTE') })
);

import prismaImport from '@/lib/prisma';
const prismaMock = prismaImport as DeepMockProxy<PrismaClient>;

import { saveEvolution } from '@/app/actions/saveEvolution';
import { generateEvolutionText } from '@/app/dashboard/[bedId]/evolution/utils/generateEvolutionText';

// ─── Interfaces dos formulários (contratos do consumidor) ─────────────────────

interface RespiratoryDataContract {
  airwayType: 'fisiologica' | 'tot' | 'tqt';
  supports: Array<{ id: string; name: string }>;
  spo2: string;
  sao2: string;
  observations: string;
  chestXray: string;
}

interface NeurologicalDataContract {
  sedationDrugs: Array<{ id: string; name: string; flow: number }>;
  neurologicalScales: string;
  pupils: string;
  bis: string;
  subjectiveObservations: string;
  enteralDrugs: string;
  pic: string;
}

interface HemodynamicsDataContract {
  vasoactiveDrugs: Array<{ id: string; name: string; flow: number }>;
  pam: string;
  fc: string;
  rhythm: string;
  enteralDrugs: string;
  tec: string;
  lactate: string;
  svco2: string;
  gapco2: string;
  observations: string;
}

interface RenalDataContract {
  diuresis: string;
  diuretics: string;
  glycemia: string;
  balance: string;
  dialysis: string;
  insulin: string;
  observations: string;
  corticoidUse: boolean;
}

interface HematoinfectiousDataContract {
  antibiotics: Array<{ name: string; startDate: Date }>;
  cultures: Array<{ material: string; sensitivity: string }>;
  temperature: string;
  biomarkers: string;
  corticoids: string;
  observations: string;
}

interface ProphylaxisDataContract {
  anticoagulation: string;
  ibp: string;
  others: string;
}

interface NutritionDataContract {
  supports: Array<{ support: { name: string } }>;
  gastricResidue: string;
  prokineticsLaxatives: string;
  lastEvacuationDate: string;
  evacuationAspect: string;
  abdomen: string;
  isSurgical: boolean;
  drainsAspect: string;
  operativeWound: string;
}

// ─── Fábrica de FullFormData ──────────────────────────────────────────────────

const makeFormData = (overrides: Record<string, any> = {}) => ({
  general: { sex: 'F', height: '162', weight: '65', airwayType: 'fisiologica' },
  generatedText: '',
  respiratory: {
    airwayType: 'fisiologica' as const,
    supports: [],
    spo2: '97', sao2: '', observations: '', chestXray: '',
  } as RespiratoryDataContract,
  neurological: {
    sedationDrugs: [], neurologicalScales: 'GCS: 15',
    pupils: 'Isocóricas', bis: '', subjectiveObservations: '',
    enteralDrugs: '', pic: '',
  } as NeurologicalDataContract,
  hemodynamics: {
    vasoactiveDrugs: [], pam: '80', fc: '75',
    rhythm: 'Sinusal', enteralDrugs: '', tec: '',
    lactate: '', svco2: '', gapco2: '', observations: '',
  } as HemodynamicsDataContract,
  nutrition: {
    supports: [], gastricResidue: '', prokineticsLaxatives: '',
    lastEvacuationDate: '', evacuationAspect: '',
    abdomen: 'RHA+', isSurgical: false,
    drainsAspect: '', operativeWound: '',
  } as NutritionDataContract,
  renal: {
    diuresis: '1200ml/24h', diuretics: '', glycemia: '110',
    balance: '-100ml', dialysis: '', insulin: '', observations: '',
    corticoidUse: false,
  } as RenalDataContract,
  hemato: {
    antibiotics: [], cultures: [], temperature: '36.5',
    biomarkers: 'PCR: 1.2', corticoids: '', observations: '',
  } as HematoinfectiousDataContract,
  prophylaxis: {
    anticoagulation: 'Enoxaparina 40mg',
    ibp: 'Omeprazol 40mg',
    others: '',
  } as ProphylaxisDataContract,
  ...overrides,
});

beforeEach(() => {
  mockReset(prismaMock as any);
  (generateEvolutionText as jest.Mock).mockClear();
  (generateEvolutionText as jest.Mock).mockReturnValue('TEXTO_GERADO_AUTOMATICAMENTE');
  (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
  (prismaMock.patient.update as jest.Mock).mockResolvedValue({});
});

// ─── C1: RespiratoryData → campos respiratory_* ───────────────────────────────
describe('C1 — Contrato: RespiratoryData → campos respiratory_* do schema', () => {
  it('airwayType "tot" → airway_type = "tot" no banco', async () => {
    const data = makeFormData({ respiratory: { ...makeFormData().respiratory, airwayType: 'tot' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.airway_type).toBe('tot');
  });

  it('airwayType "tqt" → airway_type = "tqt" no banco', async () => {
    const data = makeFormData({ respiratory: { ...makeFormData().respiratory, airwayType: 'tqt' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.airway_type).toBe('tqt');
  });

  it('spo2 → respiratory_spo2 como string', async () => {
    const data = makeFormData({ respiratory: { ...makeFormData().respiratory, spo2: '95' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(typeof call.data.respiratory_spo2).toBe('string');
    expect(call.data.respiratory_spo2).toBe('95');
  });

  it('sao2 → respiratory_sao2 como string', async () => {
    const data = makeFormData({ respiratory: { ...makeFormData().respiratory, sao2: '96' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.respiratory_sao2).toBe('96');
  });

  it('observations → respiratory_observation', async () => {
    const data = makeFormData({ respiratory: { ...makeFormData().respiratory, observations: 'Sem intercorrências' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.respiratory_observation).toBe('Sem intercorrências');
  });

  it('chestXray → respiratory_chest_xray', async () => {
    const data = makeFormData({ respiratory: { ...makeFormData().respiratory, chestXray: 'Normal' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.respiratory_chest_xray).toBe('Normal');
  });
});

// ─── C2: NeurologicalData → campos neurologic_* ───────────────────────────────
describe('C2 — Contrato: NeurologicalData → campos neurologic_* do schema', () => {
  const neuroData: NeurologicalDataContract = {
    sedationDrugs: [{ id: 'prop', name: 'Propofol', flow: 15 }],
    neurologicalScales: 'RASS: -2',
    pupils: 'Mióticas bilaterais',
    bis: '42',
    subjectiveObservations: 'Agitação ao estímulo',
    enteralDrugs: 'Tramadol 100mg',
    pic: '12',
  };

  it('neurologicalScales → neurologic_scales como string', async () => {
    const data = makeFormData({ neurological: neuroData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.neurologic_scales).toBe('RASS: -2');
  });

  it('pupils → neurologic_pupils como string', async () => {
    const data = makeFormData({ neurological: neuroData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.neurologic_pupils).toBe('Mióticas bilaterais');
  });

  it('bis → neurologic_bis como string', async () => {
    const data = makeFormData({ neurological: neuroData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.neurologic_bis).toBe('42');
  });

  it('pic → neurologic_pic como string', async () => {
    const data = makeFormData({ neurological: neuroData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.neurologic_pic).toBe('12');
  });

  it('subjectiveObservations → neurologic_observation', async () => {
    const data = makeFormData({ neurological: neuroData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.neurologic_observation).toBe('Agitação ao estímulo');
  });

  it('enteralDrugs → neurologic_enteral', async () => {
    const data = makeFormData({ neurological: neuroData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.neurologic_enteral).toBe('Tramadol 100mg');
  });
});

// ─── C3: HemodynamicsData → campos hemodynamic_* ─────────────────────────────
describe('C3 — Contrato: HemodynamicsData → campos hemodynamic_* do schema', () => {
  const hemoData: HemodynamicsDataContract = {
    vasoactiveDrugs: [{ id: 'nora', name: 'Noradrenalina', flow: 8 }],
    pam: '62', fc: '110', rhythm: 'Fibrilação Atrial',
    enteralDrugs: 'Amiodarona 200mg',
    tec: '4s', lactate: '3.2', svco2: '60', gapco2: '5',
    observations: 'Instabilidade hemodinâmica',
  };

  it.each([
    ['pam', 'hemodynamic_pam', '62'],
    ['fc', 'hemodynamic_fc', '110'],
    ['rhythm', 'hemodynamic_rhythm', 'Fibrilação Atrial'],
    ['lactate', 'hemodynamic_lactate', '3.2'],
    ['svco2', 'hemodynamic_svco2', '60'],
    ['gapco2', 'hemodynamic_gapco2', '5'],
    ['tec', 'hemodynamic_tec', '4s'],
    ['observations', 'hemodynamic_observation', 'Instabilidade hemodinâmica'],
    ['enteralDrugs', 'hemodynamic_enteral', 'Amiodarona 200mg'],
  ])('%s → %s mapeado corretamente', async (formField, dbField, expectedValue) => {
    const data = makeFormData({ hemodynamics: hemoData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data[dbField]).toBe(expectedValue);
  });
});

// ─── C4: RenalData → campos renal_* ──────────────────────────────────────────
describe('C4 — Contrato: RenalData → campos renal_* do schema', () => {
  const renalData: RenalDataContract = {
    diuresis: '2000ml/24h', diuretics: 'Furosemida 40mg',
    glycemia: '145', balance: '+500ml',
    dialysis: 'CRRT 24h', insulin: 'Insulina NPH 10UI',
    observations: 'Oligúria persistente', corticoidUse: false,
  };

  it.each([
    ['diuresis', 'renal_diuresis', '2000ml/24h'],
    ['diuretics', 'renal_diuretics', 'Furosemida 40mg'],
    ['glycemia', 'renal_glycemia', '145'],
    ['balance', 'renal_balance', '+500ml'],
    ['dialysis', 'renal_dialysis', 'CRRT 24h'],
    ['insulin', 'renal_insulin', 'Insulina NPH 10UI'],
    ['observations', 'renal_observation', 'Oligúria persistente'],
  ])('%s → %s mapeado corretamente', async (formField, dbField, expectedValue) => {
    const data = makeFormData({ renal: renalData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data[dbField]).toBe(expectedValue);
  });
});

// ─── C5: HematoinfectiousData → campos hemato_* ───────────────────────────────
describe('C5 — Contrato: HematoinfectiousData → campos hemato_* do schema', () => {
  const hematoData: HematoinfectiousDataContract = {
    antibiotics: [{ name: 'Vancomicina', startDate: new Date('2026-05-01') }],
    cultures: [{ material: 'Hemocultura', sensitivity: 'MRSA' }],
    temperature: '38.9',
    biomarkers: 'PCR: 15.3, Procalcitonina: 5.2',
    corticoids: 'Dexametasona 10mg',
    observations: 'Sepse por MRSA',
  };

  it('temperature → hemato_temperature como string', async () => {
    const data = makeFormData({ hemato: hematoData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.hemato_temperature).toBe('38.9');
  });

  it('biomarkers → hemato_biomarkers como string', async () => {
    const data = makeFormData({ hemato: hematoData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.hemato_biomarkers).toBe('PCR: 15.3, Procalcitonina: 5.2');
  });

  it('corticoids → hemato_corticoid como string', async () => {
    const data = makeFormData({ hemato: hematoData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.hemato_corticoid).toBe('Dexametasona 10mg');
  });

  it('observations → hemato_observation como string', async () => {
    const data = makeFormData({ hemato: hematoData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.hemato_observation).toBe('Sepse por MRSA');
  });

  it('antibiotics array → hemato_antibiotics como Json (any)', async () => {
    const data = makeFormData({ hemato: hematoData });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    // Contrato: campo Json — deve ser o array passado, não serializado como string
    expect(Array.isArray(call.data.hemato_antibiotics)).toBe(true);
  });
});

// ─── C6: ProphylaxisData → campos prophylaxis_* ───────────────────────────────
describe('C6 — Contrato: ProphylaxisData → campos prophylaxis_* do schema', () => {
  it.each([
    ['anticoagulation', 'prophylaxis_tev', 'Enoxaparina 40mg'],
    ['ibp', 'prophylaxis_ibp', 'Omeprazol 40mg'],
    ['others', 'prophylaxis_others', 'Vitamina D'],
  ])('%s → %s mapeado corretamente', async (formField, dbField, expectedValue) => {
    const prophylaxis: ProphylaxisDataContract = {
      anticoagulation: 'Enoxaparina 40mg',
      ibp: 'Omeprazol 40mg',
      others: 'Vitamina D',
    };
    const data = makeFormData({ prophylaxis });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data[dbField]).toBe(expectedValue);
  });
});

// ─── C7: NutritionData → campos nutrition_* (lógica de concatenação) ──────────
describe('C7 — Contrato: NutritionData → campos nutrition_* do schema', () => {
  it('supports[].support.name são concatenados com ", " em nutrition_support', async () => {
    const data = makeFormData({
      nutrition: {
        supports: [
          { support: { name: 'Enteral' } },
          { support: { name: 'Parenteral' } },
          { support: { name: 'Oral' } },
        ],
        gastricResidue: '', prokineticsLaxatives: '',
        lastEvacuationDate: '', evacuationAspect: '',
        abdomen: '', isSurgical: false, drainsAspect: '', operativeWound: '',
      },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_support).toBe('Enteral, Parenteral, Oral');
  });

  it('supports vazio → nutrition_support = "" (string vazia)', async () => {
    await saveEvolution(makeFormData(), 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_support).toBe('');
  });

  it('lastEvacuationDate + evacuationAspect → concatenados com " - "', async () => {
    const data = makeFormData({
      nutrition: {
        ...makeFormData().nutrition,
        lastEvacuationDate: '2026-05-05',
        evacuationAspect: 'Pastoso amarelado',
      },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_evacuation).toBe('2026-05-05 - Pastoso amarelado');
  });

  it('sem data de evacuação → nutrition_evacuation = apenas o aspecto', async () => {
    const data = makeFormData({
      nutrition: {
        ...makeFormData().nutrition,
        lastEvacuationDate: '',
        evacuationAspect: 'Líquido esverdeado',
      },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_evacuation).toBe('Líquido esverdeado');
  });

  it('isSurgical: true → nutrition_surgical = true (Boolean)', async () => {
    const data = makeFormData({
      nutrition: { ...makeFormData().nutrition, isSurgical: true },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_surgical).toBe(true);
    expect(typeof call.data.nutrition_surgical).toBe('boolean');
  });

  it('isSurgical: false → nutrition_surgical = false (Boolean)', async () => {
    await saveEvolution(makeFormData(), 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_surgical).toBe(false);
    expect(typeof call.data.nutrition_surgical).toBe('boolean');
  });

  it.each([
    ['gastricResidue', 'nutrition_residue', '100ml'],
    ['prokineticsLaxatives', 'nutrition_prokinetics', 'Metoclopramida'],
    ['abdomen', 'nutrition_abdomen', 'Distendido'],
    ['drainsAspect', 'nutrition_drains', 'Seroso'],
    ['operativeWound', 'nutrition_wound', 'Limpa, sem sinais de infecção'],
  ])('%s → %s mapeado corretamente', async (formField, dbField, expectedValue) => {
    const data = makeFormData({
      nutrition: { ...makeFormData().nutrition, [formField]: expectedValue },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data[dbField]).toBe(expectedValue);
  });
});

// ─── C8: GeneralData → patient_height / patient_weight (coerção string → number) ─
describe('C8 — Contrato: GeneralData → coerções de tipo para height e weight', () => {
  it('height "162" → patient_height = 162 (number)', async () => {
    const data = makeFormData({ general: { sex: 'F', height: '162', weight: '65', airwayType: 'fisiologica' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.patient_height).toBe(162);
    expect(typeof call.data.patient_height).toBe('number');
  });

  it('weight "65.5" → patient_weight = 65.5 (number)', async () => {
    const data = makeFormData({ general: { sex: 'F', height: '162', weight: '65.5', airwayType: 'fisiologica' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.patient_weight).toBe(65.5);
    expect(typeof call.data.patient_weight).toBe('number');
  });

  it('height "" (vazio) → patient_height = null', async () => {
    const data = makeFormData({ general: { sex: 'F', height: '', weight: '', airwayType: 'fisiologica' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.patient_height).toBeNull();
  });

  it('height "abc" (inválido) → patient_height = null', async () => {
    const data = makeFormData({ general: { sex: 'F', height: 'abc', weight: '', airwayType: 'fisiologica' } });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.patient_height).toBeNull();
  });

  it('weight informado → patient.update é chamado com weight como number', async () => {
    await saveEvolution(makeFormData(), 1, 10);

    expect(prismaMock.patient.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { weight: 65 },
    });
  });

  it('weight "" → patient.update NÃO é chamado', async () => {
    const data = makeFormData({ general: { sex: 'F', height: '162', weight: '', airwayType: 'fisiologica' } });
    await saveEvolution(data, 1, 10);

    expect(prismaMock.patient.update).not.toHaveBeenCalled();
  });
});

// ─── C9: Contrato de resposta (sucesso e erro) ────────────────────────────────
describe('C9 — Contrato: shape de resposta de saveEvolution', () => {
  it('resposta de sucesso é exatamente { success: true } — consumidor recarrega página', async () => {
    const result = await saveEvolution(makeFormData(), 1, 10);

    expect(result).toHaveProperty('success', true);
    expect(typeof result.success).toBe('boolean');
    // Contrato: sem campos extras obrigatórios em caso de sucesso
  });

  it('resposta de erro tem { success: false, error: string } — consumidor exibe toast', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockRejectedValue(
      new Error('Violação de constraint')
    );

    const result = await saveEvolution(makeFormData(), 1, 10);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('erro do Prisma é capturado — action nunca propaga exceção para o consumidor', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockRejectedValue(
      new Error('Unexpected DB error')
    );

    // Contrato: saveEvolution NUNCA deve lançar exceção; sempre retorna um objeto
    await expect(saveEvolution(makeFormData(), 1, 10)).resolves.not.toThrow();
    const result = await saveEvolution(makeFormData(), 1, 10);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('success');
  });
});

// ─── C10: Contrato de geração de texto ────────────────────────────────────────
describe('C10 — Contrato: generated_text no campo do banco', () => {
  it('generatedText presente no formData → salvo diretamente, sem chamar generateEvolutionText', async () => {
    const data = makeFormData({ generatedText: 'TEXTO PREVIAMENTE GERADO NO FRONTEND' });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.generated_text).toBe('TEXTO PREVIAMENTE GERADO NO FRONTEND');
    expect(generateEvolutionText).not.toHaveBeenCalled();
  });

  it('generatedText vazio → generateEvolutionText é chamado e retorno é salvo', async () => {
    await saveEvolution(makeFormData({ generatedText: '' }), 1, 10);

    expect(generateEvolutionText).toHaveBeenCalledTimes(1);
    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.generated_text).toBe('TEXTO_GERADO_AUTOMATICAMENTE');
  });

  it('generated_text no banco é string — consumidor exibe no painel de evoluções', async () => {
    await saveEvolution(makeFormData(), 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(typeof call.data.generated_text).toBe('string');
  });
});
