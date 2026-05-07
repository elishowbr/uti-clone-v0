/**
 * Testes de Integração — saveEvolution.ts (Nível 2 QA Strategy)
 *
 * Estratégia: PrismaClient mockado via jest-mock-extended com import type
 * do cliente gerado em @/app/generated/prisma/client (Prisma 6, saída customizada).
 *
 * Cobertura:
 *  - saveEvolution (fluxo principal, mapeamento de dados, edge cases)
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

jest.mock(
  '@/app/dashboard/[bedId]/evolution/utils/generateEvolutionText',
  () => ({ generateEvolutionText: jest.fn(() => 'TEXTO_GERADO_MOCK') })
);

import prismaImport from '@/lib/prisma';
const prismaMock = prismaImport as DeepMockProxy<PrismaClient>;

import { saveEvolution } from '@/app/actions/saveEvolution';
import { generateEvolutionText } from '@/app/dashboard/[bedId]/evolution/utils/generateEvolutionText';

// ─── Fábrica de FullFormData ──────────────────────────────────────────────────
const makeFormData = (overrides: Record<string, any> = {}) => ({
  general: { sex: 'F', height: '162', weight: '65', airwayType: 'fisiologica' },
  generatedText: 'Texto pré-gerado',
  respiratory: {
    airwayType: 'fisiologica' as const,
    supports: [],
    spo2: '97', sao2: '', observations: '', chestXray: '',
  },
  neurological: {
    sedationDrugs: [], neurologicalScales: 'GCS: 15',
    pupils: 'Isocóricas', bis: '', subjectiveObservations: '',
    enteralDrugs: '', pic: '',
  },
  hemodynamics: {
    vasoactiveDrugs: [], pam: '80', fc: '75',
    rhythm: 'Sinusal', enteralDrugs: '', tec: '',
    lactate: '', svco2: '', gapco2: '', observations: '',
  },
  nutrition: {
    supports: [],
    gastricResidue: '', prokineticsLaxatives: '',
    lastEvacuationDate: '', evacuationAspect: '',
    abdomen: 'RHA+', isSurgical: false,
    drainsAspect: '', operativeWound: '',
  },
  renal: {
    diuresis: '1200ml/24h', diuretics: '', glycemia: '110',
    balance: '-100ml', dialysis: '', insulin: '', observations: '',
    corticoidUse: false,
  },
  hemato: {
    antibiotics: [], cultures: [], temperature: '36.5',
    biomarkers: '', corticoids: '', observations: '',
  },
  prophylaxis: {
    anticoagulation: 'Enoxaparina 40mg',
    ibp: 'Omeprazol 40mg',
    others: '',
  },
  ...overrides,
});

// ─── Reset entre testes ───────────────────────────────────────────────────────
beforeEach(() => {
  mockReset(prismaMock as any);
  (generateEvolutionText as jest.Mock).mockClear();
  (generateEvolutionText as jest.Mock).mockReturnValue('TEXTO_GERADO_MOCK');
  (prismaMock.clinicalEvolution.create as jest.Mock).mockResolvedValue({ id: 1 });
  (prismaMock.patient.update as jest.Mock).mockResolvedValue({});
});

// ─── Fluxo principal ──────────────────────────────────────────────────────────
describe('saveEvolution — fluxo principal', () => {
  it('retorna { success: true } quando evolução é salva com sucesso', async () => {
    const result = await saveEvolution(makeFormData(), 1, 10);

    expect(result.success).toBe(true);
  });

  it('chama clinicalEvolution.create com bed_id e patient_id corretos', async () => {
    await saveEvolution(makeFormData(), 5, 20);

    expect(prismaMock.clinicalEvolution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bed_id: 5,
          patient_id: 20,
        }),
      })
    );
  });

  it('chama clinicalEvolution.create com doctor_id = 1 (HARDCODED)', async () => {
    await saveEvolution(makeFormData(), 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.doctor_id).toBe(1);
  });

  it('retorna { success: false, error } quando Prisma lança exceção', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockRejectedValue(
      new Error('constraint violation')
    );

    const result = await saveEvolution(makeFormData(), 1, 10);

    expect(result.success).toBe(false);
    expect(typeof (result as any).error).toBe('string');
  });

  it('nunca propaga exceção — sempre retorna objeto de resultado', async () => {
    (prismaMock.clinicalEvolution.create as jest.Mock).mockRejectedValue(
      new Error('Unexpected error')
    );

    await expect(saveEvolution(makeFormData(), 1, 10)).resolves.not.toThrow();
    const result = await saveEvolution(makeFormData(), 1, 10);
    expect(result).toHaveProperty('success');
  });
});

// ─── Mapeamento de dados ──────────────────────────────────────────────────────
describe('saveEvolution — mapeamento de campos', () => {
  it('height string → patient_height como number', async () => {
    await saveEvolution(makeFormData({ general: { sex: 'F', height: '170', weight: '70', airwayType: 'fisiologica' } }), 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.patient_height).toBe(170);
    expect(typeof call.data.patient_height).toBe('number');
  });

  it('weight string → patient_weight como number', async () => {
    await saveEvolution(makeFormData({ general: { sex: 'F', height: '162', weight: '65.5', airwayType: 'fisiologica' } }), 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.patient_weight).toBe(65.5);
    expect(typeof call.data.patient_weight).toBe('number');
  });

  it('height inválida ("abc") → patient_height = null', async () => {
    await saveEvolution(makeFormData({ general: { sex: 'F', height: 'abc', weight: '', airwayType: 'fisiologica' } }), 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.patient_height).toBeNull();
  });

  it('airwayType → airway_type no banco', async () => {
    const data = makeFormData({
      respiratory: { ...makeFormData().respiratory, airwayType: 'tot' },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.airway_type).toBe('tot');
  });

  it('isSurgical booleano → nutrition_surgical como boolean', async () => {
    const data = makeFormData({
      nutrition: { ...makeFormData().nutrition, isSurgical: true },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_surgical).toBe(true);
    expect(typeof call.data.nutrition_surgical).toBe('boolean');
  });

  it('supports concatenados com ", " em nutrition_support', async () => {
    const data = makeFormData({
      nutrition: {
        ...makeFormData().nutrition,
        supports: [
          { support: { name: 'Enteral' } },
          { support: { name: 'Parenteral' } },
        ],
      },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_support).toBe('Enteral, Parenteral');
  });

  it('lastEvacuationDate + evacuationAspect concatenados com " - "', async () => {
    const data = makeFormData({
      nutrition: {
        ...makeFormData().nutrition,
        lastEvacuationDate: '2026-05-06',
        evacuationAspect: 'Pastoso',
      },
    });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.nutrition_evacuation).toBe('2026-05-06 - Pastoso');
  });
});

// ─── Atualização de peso do paciente ─────────────────────────────────────────
describe('saveEvolution — atualização de peso do paciente', () => {
  it('chama patient.update com weight quando weight está preenchido', async () => {
    await saveEvolution(makeFormData(), 1, 10);

    expect(prismaMock.patient.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { weight: 65 },
    });
  });

  it('NÃO chama patient.update quando weight está vazio', async () => {
    await saveEvolution(
      makeFormData({ general: { sex: 'F', height: '162', weight: '', airwayType: 'fisiologica' } }),
      1, 10
    );

    expect(prismaMock.patient.update).not.toHaveBeenCalled();
  });
});

// ─── Geração de texto ─────────────────────────────────────────────────────────
describe('saveEvolution — geração de texto', () => {
  it('usa generatedText do formData quando preenchido, sem chamar generateEvolutionText', async () => {
    const data = makeFormData({ generatedText: 'TEXTO FORNECIDO PELO FRONTEND' });
    await saveEvolution(data, 1, 10);

    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.generated_text).toBe('TEXTO FORNECIDO PELO FRONTEND');
    expect(generateEvolutionText).not.toHaveBeenCalled();
  });

  it('chama generateEvolutionText quando generatedText está vazio', async () => {
    const data = makeFormData({ generatedText: '' });
    await saveEvolution(data, 1, 10);

    expect(generateEvolutionText).toHaveBeenCalled();
    const call = (prismaMock.clinicalEvolution.create as jest.Mock).mock.calls[0][0];
    expect(call.data.generated_text).toBe('TEXTO_GERADO_MOCK');
  });
});
