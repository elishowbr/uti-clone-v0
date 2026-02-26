'use client';

import React, { useState } from 'react';
import { Brain, Eye, Activity, Pill, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import NeurologicalScalesSelector from '../selectors/NeurologicalScalesSelector';
import { SmartTextArea } from '../SmartTextArea';
import DrugSelector, { DrugDefinition, SelectedDrug } from '../selectors/DrugSelector';

// --- Interfaces ---
export interface NeurologicalData {
  sedationDrugs: SelectedDrug[];
  neurologicalScales: string;
  pupils: string;
  bis: string;
  subjectiveObservations: string;
  enteralDrugs: string;
  pic: string;
}
interface NeurologicalFormProps {
  data: NeurologicalData;
  onChange: (field: keyof NeurologicalData, value: any) => void;
  patientWeight: number;
  isIntubated: boolean;
}

export default function NeurologicalForm({
  data,
  onChange,
  patientWeight,
  isIntubated
}: NeurologicalFormProps) {

  const [isExpanded, setIsExpanded] = useState(false);

  const safeData = data || {};

  const handleDrugsChange = (newDrugs: SelectedDrug[]) => onChange('sedationDrugs', newDrugs);
  const handleScalesChange = (newScales: string) => onChange('neurologicalScales', newScales);

  // Função para formatar a string de prévia das drogas
  const formatSedationDrugs = (drugs: SelectedDrug[]) => {
    if (!drugs || drugs.length === 0) return '';
    return drugs
      .filter(d => d.flow > 0)
      .map(d => `${d.drug.name} ${d.flow} ml/h (${d.dose} ${d.drug.doseUnit})`)
      .join(', ');
  };

  const generateNeuroPreview = () => {
    const parts = [];

    const sedationText = formatSedationDrugs(safeData.sedationDrugs);
    if (sedationText) parts.push(`Sedação: ${sedationText}`);

    if (safeData.neurologicalScales) parts.push(safeData.neurologicalScales);
    if (safeData.pupils) parts.push(`Pupilas: ${safeData.pupils}`);
    if (safeData.bis) parts.push(`BIS: ${safeData.bis}`);
    if (safeData.pic) parts.push(`PIC: ${safeData.pic}`);
    if (safeData.enteralDrugs) parts.push(`Drogas Enterais: ${safeData.enteralDrugs}`);
    if (safeData.subjectiveObservations) parts.push(`Obs: ${safeData.subjectiveObservations}`);

    return parts.join(' | ');
  };

  const previewText = generateNeuroPreview();

  const NEURO_DRUGS: DrugDefinition[] = [
    { id: 'fentanil_diluido', name: 'Fentanil diluído', concentration: 10, unit: 'mcg/ml', doseUnit: 'mcg/kg/h', conversionFactor: 1 },
    { id: 'fentanil_puro', name: 'Fentanil puro', concentration: 50, unit: 'mcg/ml', doseUnit: 'mcg/kg/h', conversionFactor: 1 },
    { id: 'propofol', name: 'Propofol', concentration: 10, unit: 'mg/ml', doseUnit: 'mg/kg/h', conversionFactor: 1 },
    { id: 'midazolam', name: 'Midazolam', concentration: 1, unit: 'mg/ml', doseUnit: 'mg/kg/h', conversionFactor: 1 },
    { id: 'cetamina', name: 'Cetamina', concentration: 5, unit: 'mg/ml', doseUnit: 'mg/kg/h', conversionFactor: 1 },
    { id: 'dexmedetomidina', name: 'Dexmedetomidina', concentration: 4, unit: 'mcg/ml', doseUnit: 'mcg/kg/h', conversionFactor: 1 },
    { id: 'morfina', name: 'Morfina', concentration: 1, unit: 'mg/ml', doseUnit: 'mg/kg/h', conversionFactor: 1 }
  ];

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all duration-300">

      {/* Cabeçalho Interativo */}
      <div
        className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Neurológico</h2>
            <p className="text-xs text-slate-500 hidden sm:block">Sedação, escalas e monitorização cerebral</p>
          </div>
        </div>

        <button
          className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
          type="button"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Conteúdo Expansível */}
      {isExpanded ? (
        <div className="p-4 md:p-6 space-y-8 animate-fade-in-down">

          {/* Seção 1: Drogas e Escalas */}
          <div>
            <DrugSelector
              label="Sedação Contínua"
              colorTheme="purple"
              availableDrugsList={NEURO_DRUGS} 
              selectedDrugs={safeData.sedationDrugs || []}
              onChange={handleDrugsChange}
              patientWeight={patientWeight}
            />
          </div>

          <div className="border-t border-slate-100"></div>

          <div>
            <NeurologicalScalesSelector
              value={safeData.neurologicalScales || ''}
              onChange={handleScalesChange}
              isIntubated={isIntubated}
            />
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Seção 2: TextAreas Inteligentes (Agora usando o componente importado) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SmartTextArea
              label="Pupilas"
              icon={Eye}
              value={safeData.pupils}
              onChange={(val) => onChange('pupils', val)}
              placeholder="Descreva o tamanho e fotorreação..."
              colorTheme='purple'
              tags={['Isocóricas e fotorreagentes', 'Mióticas', 'Midriáticas', 'Anisocóricas', 'Lentas', 'Fixas']}
            />

            <SmartTextArea
              label="Drogas Enterais em Uso"
              icon={Pill}
              value={safeData.enteralDrugs}
              onChange={(val) => onChange('enteralDrugs', val)}
              placeholder="Digite regime e doses..."
              colorTheme='purple'
              tags={['Dipirona', 'Paracetamol', 'Metadona', 'Haloperidol', 'Risperidona', 'Quetiapina', 'Pregabalina', 'Gabapentina', 'Fenitoína', 'Levetiracetam']}
            />

            <SmartTextArea
              label="BIS (Índice Bispectral)"
              helperText="Se aplicável"
              icon={Activity}
              value={safeData.bis}
              onChange={(val) => onChange('bis', val)}
              placeholder="Valor ou intervalo alvo..."
              colorTheme='purple'
              tags={['BIS 40-60', 'BIS 30-50', 'Sem monitorização BIS', 'Valor instável']}
              startHidden
            />

            <SmartTextArea
              label="PIC (Pressão Intracraniana)"
              icon={AlertCircle}
              value={safeData.pic}
              onChange={(val) => onChange('pic', val)}
              placeholder="Valores de PIC..."
              colorTheme='purple'
              tags={['PIC < 20 mmHg', 'PIC 20-25 mmHg', 'PIC > 25 mmHg', 'Sem monitorização de PIC', 'DVE aberta', 'DVE fechada']}
              startHidden
            />
          </div>

          <SmartTextArea
            label="Observações Subjetivas"
            icon={FileText}
            value={safeData.subjectiveObservations}
            onChange={(val) => onChange('subjectiveObservations', val)}
            placeholder="Outras observações sobre o estado neurológico..."
            colorTheme='purple'
            tags={['Sem alterações significativas', 'Melhora do nível de consciência', 'Mantém padrão', 'Paciente mais responsivo', 'Piora neurológica', 'Movimenta 4 membros', 'Hemiparesia']}
            startHidden
          />

          {/* Prévia Completa */}
          {previewText && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mt-6 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <div className="text-xs font-bold text-purple-800 uppercase tracking-wide">Prévia da Evolução Neurológica</div>
              </div>
              <div className="text-sm text-purple-900 font-medium leading-relaxed bg-white/50 p-3 rounded-lg border border-purple-100">
                {previewText}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Estado Recolhido */
        previewText && (
          <div className="px-6 py-4 bg-purple-50/30">
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <span className="font-bold text-purple-700 whitespace-nowrap">Resumo:</span>
              <span className="line-clamp-2">{previewText}</span>
            </div>
          </div>
        )
      )}
    </section>
  );
}