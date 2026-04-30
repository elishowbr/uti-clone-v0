/**
 * Testes de Integração — saveEvolution.ts
 * 
 * Cobertura:
 *  - saveEvolution: persistência completa no banco
 *  - Mapeamento correto de todos os campos clínicos
 *  - Geração de texto consolidado
 *  - Atualização de peso do paciente
 *  - Tratamento de erros
 */

import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// ─── Mock do Prisma ───────────────────────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock(
  '@/app/dashboard/[bedId]/evolution/utils/generateEvolutionText',
  () => ({
    generateEvolutionText: jest.fn(() => 'TEXTO GERADO MOCK'),
  })
);

import prismaImport from '@/lib/prisma';
const prismaMock = prismaImport as DeepMockProxy<PrismaClient>;

import { saveEvolution } from '@/app/actions/saveEvolution';
import { generateEvolutionText } from '@/app/dashboard/[bedId]/evolution/utils/generateEvolutionText';

// ─── Fábrica de FullFormData ──────────────────────────────────────────────────
const makeFullFormData = (overrides: Record<string, any> = {}) => ({
  general: {
    sex: 'M',
    height: '175',
    weight: '80',
    airwayType: 'fisiologica',
  },
  generatedText: '',
  respiratory: {
    airwayType: 'fisiologica',
    supports: [],
    spo2: '98',
    sao2: '',
    observations: '',
    chestXray: '',
  },
  neurological: {
    sedationDrugs: [],
    neurologicalScales: 'GCS: 15',
    pupils: 'Isocóricas 3mm',
    bis: '',
    subjectiveObservations: '',
    enteralDrugs: '',
    pic: '',
  },
  hemodynamics: {
    vasoactiveDrugs: [],
    pam: '75',
    fc: '72',
    rhythm: 'Sinusal',
    enteralDrugs: '',
    tec: '',
    lactate: '',
    svco2: '',
    gapco2: '',
    observations: '',
  },
  nutrition: {
    supports: [],
    gastricResidue: '',
    prokineticsLaxatives: '',
    lastEvacuationDate: '',
    evacuationAspect: '',
    abdomen: 'RHA+',
    isSurgical: false,
    drainsAspect: '',
    operativeWound: '',
  },
  renal: {
    diuresis: '1500ml/24h',
    diuretics: '',
    glycemia: '120',
    balance: '+200ml',
    dialysis: '',
    insulin: '',
    observations: '',
    corticoidUse: false,
  },
  hemato: {
    antibiotics: [],
    cultures: [],
    temperature: '36.8',
    biomarkers: 'PCR: 2.1',
    corticoids: '',
    observations: '',
  },
  prophylaxis: {
    anticoagulation: 'Enoxaparina 40mg',
    ibp: 'Omeprazol 40mg',
    others: '',
  },
  ...overrides,
});

beforeEach(() => {
  mockReset(prismaMock as any);
  (generateEvolutionText as jest.Mock).mockClear();
  (generateEvolutionText as jest.Mock).mockReturnValue('TEXTO GERADO MOCK');
});

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('saveEvolution', () => {

  it('salva evolução com sucesso e retorna { success: true }', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const result = await saveEvolution(makeFullFormData(), 1, 10);

    expect(result.success).toBe(true);
    expect(prismaMock.clinicalEvolution.create).toHaveBeenCalledTimes(1);
  });

  it('mapeia campos gerais (height, weight) corretamente', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData(), 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.patient_height).toBe(175);
    expect(createCall.data.patient_weight).toBe(80);
  });

  it('mapeia campos respiratórios corretamente', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      respiratory: {
        airwayType: 'tot',
        supports: [{ id: 'vm', name: 'VM' }],
        spo2: '96',
        sao2: '97',
        observations: 'Sem intercorrências',
        chestXray: 'Normal',
      },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.airway_type).toBe('tot');
    expect(createCall.data.respiratory_spo2).toBe('96');
    expect(createCall.data.respiratory_sao2).toBe('97');
    expect(createCall.data.respiratory_observation).toBe('Sem intercorrências');
    expect(createCall.data.respiratory_chest_xray).toBe('Normal');
  });

  it('mapeia campos neurológicos corretamente', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      neurological: {
        sedationDrugs: [{ id: 'prop', name: 'Propofol', flow: 20 }],
        neurologicalScales: 'RASS: -2',
        pupils: 'Mióticas',
        bis: '45',
        subjectiveObservations: 'Agitação',
        enteralDrugs: 'Tramadol',
        pic: '15',
      },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.neurologic_scales).toBe('RASS: -2');
    expect(createCall.data.neurologic_pupils).toBe('Mióticas');
    expect(createCall.data.neurologic_bis).toBe('45');
    expect(createCall.data.neurologic_pic).toBe('15');
    expect(createCall.data.neurologic_observation).toBe('Agitação');
  });

  it('mapeia campos hemodinâmicos corretamente', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      hemodynamics: {
        vasoactiveDrugs: [{ id: 'nora', name: 'Noradrenalina', flow: 5 }],
        pam: '65',
        fc: '95',
        rhythm: 'FA',
        enteralDrugs: 'Amiodarona',
        tec: '3s',
        lactate: '2.5',
        svco2: '65',
        gapco2: '4',
        observations: 'Instabilidade',
      },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.hemodynamic_pam).toBe('65');
    expect(createCall.data.hemodynamic_fc).toBe('95');
    expect(createCall.data.hemodynamic_rhythm).toBe('FA');
    expect(createCall.data.hemodynamic_lactate).toBe('2.5');
    expect(createCall.data.hemodynamic_svco2).toBe('65');
    expect(createCall.data.hemodynamic_gapco2).toBe('4');
    expect(createCall.data.hemodynamic_observation).toBe('Instabilidade');
  });

  it('mapeia campos renais corretamente', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData(), 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.renal_diuresis).toBe('1500ml/24h');
    expect(createCall.data.renal_glycemia).toBe('120');
    expect(createCall.data.renal_balance).toBe('+200ml');
  });

  it('mapeia campos hematoinfecciosos corretamente', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData(), 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.hemato_temperature).toBe('36.8');
    expect(createCall.data.hemato_biomarkers).toBe('PCR: 2.1');
  });

  it('mapeia profilaxias corretamente', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData(), 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.prophylaxis_tev).toBe('Enoxaparina 40mg');
    expect(createCall.data.prophylaxis_ibp).toBe('Omeprazol 40mg');
  });

  it('usa generatedText do formData quando informado', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({ generatedText: 'TEXTO JÁ GERADO NO FRONT' });
    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.generated_text).toBe('TEXTO JÁ GERADO NO FRONT');
    expect(generateEvolutionText).not.toHaveBeenCalled();
  });

  it('chama generateEvolutionText quando generatedText está vazio', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData({ generatedText: '' }), 1, 10);

    expect(generateEvolutionText).toHaveBeenCalledTimes(1);
    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.generated_text).toBe('TEXTO GERADO MOCK');
  });

  it('concatena suportes nutricionais com vírgula', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      nutrition: {
        supports: [
          { support: { name: 'Enteral' } },
          { support: { name: 'Parenteral' } },
        ],
        gastricResidue: '', prokineticsLaxatives: '',
        lastEvacuationDate: '', evacuationAspect: '',
        abdomen: '', isSurgical: false,
        drainsAspect: '', operativeWound: '',
      },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.nutrition_support).toBe('Enteral, Parenteral');
  });

  it('salva evacuação com data e aspecto concatenados', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      nutrition: {
        supports: [], gastricResidue: '', prokineticsLaxatives: '',
        lastEvacuationDate: '2026-04-28',
        evacuationAspect: 'Pastoso',
        abdomen: '', isSurgical: false,
        drainsAspect: '', operativeWound: '',
      },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.nutrition_evacuation).toBe('2026-04-28 - Pastoso');
  });

  it('salva apenas aspecto da evacuação quando data não informada', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      nutrition: {
        supports: [], gastricResidue: '', prokineticsLaxatives: '',
        lastEvacuationDate: '',
        evacuationAspect: 'Líquido',
        abdomen: '', isSurgical: false,
        drainsAspect: '', operativeWound: '',
      },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.nutrition_evacuation).toBe('Líquido');
  });

  it('atualiza peso do paciente quando weight informado', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData(), 1, 10);

    expect(prismaMock.patient.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { weight: 80 },
    });
  });

  it('não atualiza peso do paciente quando weight está vazio', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });

    await saveEvolution(
      makeFullFormData({ general: { sex: 'M', height: '175', weight: '', airwayType: 'fisiologica' } }),
      1, 10
    );

    expect(prismaMock.patient.update).not.toHaveBeenCalled();
  });

  it('passa bed_id e patient_id corretos para o create', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData(), 5, 42);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.bed_id).toBe(5);
    expect(createCall.data.patient_id).toBe(42);
  });

  it('usa HARDCODED_DOCTOR_ID = 1 no create', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    await saveEvolution(makeFullFormData(), 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.doctor_id).toBe(1);
  });

  it('retorna { success: false, error } quando create falha', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockRejectedValue(
      new Error('Unique constraint failed')
    );

    const result = await saveEvolution(makeFullFormData(), 1, 10);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unique constraint failed');
  });

  it('trata height inválido (NaN) como null', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      general: { sex: 'M', height: 'abc', weight: '', airwayType: 'fisiologica' },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.patient_height).toBeNull();
    expect(createCall.data.patient_weight).toBeNull();
  });

  it('nutrition_surgical é salvo como Boolean', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.patient.update as jest.Mock).mockResolvedValue({});

    const data = makeFullFormData({
      nutrition: { ...makeFullFormData().nutrition, isSurgical: true },
    });

    await saveEvolution(data, 1, 10);

    const createCall = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(typeof createCall.data.nutrition_surgical).toBe('boolean');
    expect(createCall.data.nutrition_surgical).toBe(true);
  });
});