import { generateEvolutionText, FullFormData } from '../app/dashboard/[bedId]/evolution/utils/generateEvolutionText';

// ─── Fábrica de dados completos ──────────────────────────────────────────────
const makeFullData = (overrides: Partial<FullFormData> = {}): FullFormData => ({
  general: { sex: 'M', height: '175', weight: '70', airwayType: 'fisiologica' },
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
    neurologicalScales: '',
    pupils: '',
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
    abdomen: '',
    isSurgical: false,
    drainsAspect: '',
    operativeWound: '',
  },
  renal: {
    diuresis: '',
    diuretics: '',
    glycemia: '',
    balance: '',
    dialysis: '',
    insulin: '',
    observations: '',
    corticoidUse: false,
  },
  hemato: {
    antibiotics: [],
    cultures: [],
    temperature: '',
    biomarkers: '',
    corticoids: '',
    observations: '',
  },
  prophylaxis: {
    anticoagulation: '',
    ibp: '',
    others: '',
  },
  ...overrides,
});

// ─── Testes ──────────────────────────────────────────────────────────────────
describe('generateEvolutionText', () => {
  it('should contain all required section headers', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toMatch(/EVOLUÇÃO MÉDICA - UTI/);
    expect(result).toMatch(/1\. NEUROLÓGICO/);
    expect(result).toMatch(/2\. HEMODINÂMICO/);
    expect(result).toMatch(/3\. RESPIRATÓRIO/);
    expect(result).toMatch(/4\. RENAL\/METABÓLICO/);
    expect(result).toMatch(/5\. HEMATOINFECCIOSO/);
    expect(result).toMatch(/6\. NUTRICIONAL/);
    expect(result).toMatch(/7\. PROFILAXIAS/);
  });

  it('should include patient weight and height in header', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toContain('70kg');
    expect(result).toContain('175cm');
  });

  it('should show "Peso não informado" and "Não informada" when general data is missing', () => {
    const data = makeFullData({
      general: { sex: 'F', height: '', weight: '', airwayType: 'fisiologica' },
    });
    const result = generateEvolutionText(data);
    expect(result).toContain('Peso não informado');
    expect(result).toContain('Não informada');
  });

  // ── Neurológico ────────────────────────────────────────────────────────────
  it('should show "Sem sedação contínua" when no sedation drugs are present', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toContain('Sem sedação contínua');
  });

  it('should include sedation drug details when present', () => {
    const drug = {
      id: 'propofol',
      name: 'Propofol',
      concentration: 10,
      unit: 'mg/ml',
      doseUnit: 'mg/kg/h',
      conversionFactor: 1,
    };
    const data = makeFullData({
      neurological: {
        sedationDrugs: [{ flow: 20, dose: 2.8, drug }],
        neurologicalScales: 'RASS: -2 | GCS: 8T',
        pupils: 'Isocóricas 3mm fotorreagentes',
        bis: '45',
        subjectiveObservations: '',
        enteralDrugs: '',
        pic: '',
      },
    });
    const result = generateEvolutionText(data);
    expect(result).toContain('Propofol');
    expect(result).toContain('20ml/h');
    expect(result).toContain('RASS: -2');
    expect(result).toContain('BIS: 45');
  });

  // ── Hemodinâmico ───────────────────────────────────────────────────────────
  it('should show "Sem drogas vasoativas" when none are present', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toContain('Sem drogas vasoativas');
  });

  it('should include vasoactive drug and vital signs when present', () => {
    const drug = {
      id: 'noradrenalina_simples',
      name: 'Noradrenalina',
      concentration: 64,
      unit: 'mcg/ml',
      doseUnit: 'mcg/kg/min',
      conversionFactor: 60,
    };
    const data = makeFullData({
      hemodynamics: {
        vasoactiveDrugs: [{ flow: 5, dose: 0.1, drug }],
        pam: '65',
        fc: '90',
        rhythm: 'Sinusal',
        enteralDrugs: '',
        tec: '3s',
        lactate: '2.1',
        svco2: '68',
        gapco2: '',
        observations: '',
      },
    });
    const result = generateEvolutionText(data);
    expect(result).toContain('Noradrenalina');
    expect(result).toContain('PAM: 65mmHg');
    expect(result).toContain('FC: 90bpm');
    expect(result).toContain('Lactato: 2.1');
    expect(result).toContain('SvcO2: 68%');
  });

  // ── Respiratório ───────────────────────────────────────────────────────────
  it('should show "IOT" when airwayType is "tot"', () => {
    const data = makeFullData({
      respiratory: {
        airwayType: 'tot',
        supports: [],
        spo2: '96',
        sao2: '',
        observations: '',
        chestXray: '',
      },
    });
    expect(generateEvolutionText(data)).toContain('IOT');
  });

  it('should show "TQT" when airwayType is "tqt"', () => {
    const data = makeFullData({
      respiratory: {
        airwayType: 'tqt',
        supports: [],
        spo2: '97',
        sao2: '',
        observations: '',
        chestXray: '',
      },
    });
    expect(generateEvolutionText(data)).toContain('TQT');
  });

  it('should include SpO2 in the respiratory section', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toContain('SpO2: 98%');
  });

  // ── Hematoinfeccioso ───────────────────────────────────────────────────────
  it('should show "ATB em uso: Nenhum" when antibiotics array is empty', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toContain('ATB em uso: Nenhum');
  });

  it('should include antibiotic with day count when present', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-31'));

    const data = makeFullData({
      hemato: {
        antibiotics: [{ id: '1', name: 'Ceftriaxona', startDate: new Date('2026-03-23') }],
        cultures: [],
        temperature: '38.5',
        biomarkers: 'PCR: 12',
        corticoids: '',
        observations: '',
      },
    });
    const result = generateEvolutionText(data);
    expect(result).toContain('Ceftriaxona (D8)');
    expect(result).toContain('38.5');

    jest.useRealTimers();
  });

  it('should include culture sensitivity when present', () => {
    const data = makeFullData({
      hemato: {
        antibiotics: [],
        cultures: [{ id: '1', material: 'Sangue', sensitivity: 'Sensível' }],
        temperature: '',
        biomarkers: '',
        corticoids: '',
        observations: '',
      },
    });
    const result = generateEvolutionText(data);
    expect(result).toContain('Sangue');
  });

  // ── Nutricional ────────────────────────────────────────────────────────────
  it('should show "Zero/Suspensa" when no nutrition supports are present', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toContain('Dieta: Zero/Suspensa');
  });

  it('should include surgical fields (FO and drenos) when isSurgical is true', () => {
    const data = makeFullData({
      nutrition: {
        supports: [],
        gastricResidue: '',
        prokineticsLaxatives: '',
        lastEvacuationDate: '',
        evacuationAspect: '',
        abdomen: '',
        isSurgical: true,
        drainsAspect: 'Seroso',
        operativeWound: 'Limpa',
      },
    });
    const result = generateEvolutionText(data);
    expect(result).toContain('Cirúrgico');
    expect(result).toContain('Seroso');
    expect(result).toContain('Limpa');
  });

  // ── Profilaxias ────────────────────────────────────────────────────────────
  it('should show "Não prescrito" when prophylaxis fields are empty', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result).toContain('TEV: Não prescrito');
    expect(result).toContain('Gástrica: Não prescrito');
  });

  it('should include prophylaxis values when present', () => {
    const data = makeFullData({
      prophylaxis: {
        anticoagulation: 'Enoxaparina 40 mg/dia',
        ibp: 'Omeprazol 40 mg/dia',
        others: 'Decúbito elevado 30°',
      },
    });
    const result = generateEvolutionText(data);
    expect(result).toContain('Enoxaparina 40 mg/dia');
    expect(result).toContain('Omeprazol 40 mg/dia');
    expect(result).toContain('Decúbito elevado 30°');
  });

  it('should return a non-empty string for a complete data set', () => {
    const result = generateEvolutionText(makeFullData());
    expect(result.length).toBeGreaterThan(100);
  });
});
