'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Activity, Scale, User, Bed as BedIcon, RotateCcw } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

// Actions
import { saveEvolution } from '@/app/actions/saveEvolution';
import { getPatientFromBed, getLastEvolution } from '@/app/actions/patientData';

// Componentes
import RespiratoryForm, { RespiratoryData } from './components/forms/RespiratoryForm';
import NeurologicalForm, { NeurologicalData } from './components/forms/NeurologicalForm';
import HemodynamicsForm, { HemodynamicsData } from './components/forms/HemodynamicsForm';
import NutritionForm, { NutritionData } from './components/forms/NutritionForm';
import RenalForm, { RenalData } from './components/forms/RenalForm';
import HematoinfectiousForm, { HematoinfectiousData } from './components/forms/HematoinfectiousForm';
import ProphylaxisForm, { ProphylaxisData } from './components/forms/ProphylaxisForm';
import EvolutionSummaryModal from './components/EvolutionSummaryModal'; // Certifique-se de atualizar este arquivo também (ver abaixo)
import { generateEvolutionText } from './utils/generateEvolutionText';

// Interfaces e Parsers (mantidos iguais)
interface FormData {
    general: { sex: string; height: string; weight: string; airwayType: string; };
    generatedText: string;
    respiratory: RespiratoryData;
    neurological: NeurologicalData;
    hemodynamics: HemodynamicsData;
    nutrition: NutritionData;
    renal: RenalData;
    hemato: HematoinfectiousData;
    prophylaxis: ProphylaxisData;
}

export default function EvolutionPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const bedId = Number(params.bedId);
    const mode = searchParams.get('mode');

    // Estado de Carregamento
    const [isLoading, setIsLoading] = useState(true);
    const [patientInfo, setPatientInfo] = useState<{ id: number, name: string, bedLabel: string } | null>(null);

    // --- ESTADOS GLOBAIS ---
    const [generalData, setGeneralData] = useState({ sex: '', height: '', weight: '', airwayType: 'fisiologica' , generatedText: '' });
    const [respData, setRespData] = useState<RespiratoryData>({ airwayType: 'fisiologica', supports: [], spo2: '', sao2: '', observations: '', chestXray: '' });
    const [neuroData, setNeuroData] = useState<NeurologicalData>({ sedationDrugs: [], neurologicalScales: '', pupils: '', bis: '', subjectiveObservations: '', enteralDrugs: '', pic: '' });
    const [hemoData, setHemoData] = useState<HemodynamicsData>({ vasoactiveDrugs: [], pam: '', fc: '', rhythm: '', enteralDrugs: '', tec: '', lactate: '', svco2: '', gapco2: '', observations: '' });
    const [nutriData, setNutriData] = useState<NutritionData>({ supports: [], gastricResidue: '', prokineticsLaxatives: '', lastEvacuationDate: '', evacuationAspect: '', abdomen: '', isSurgical: false, drainsAspect: '', operativeWound: '' });
    const [renalData, setRenalData] = useState<RenalData>({ diuresis: '', diuretics: '', glycemia: '', balance: '', dialysis: '', insulin: '', observations: '', corticoidUse: false });
    const [hematoData, setHematoData] = useState<HematoinfectiousData>({ antibiotics: [], cultures: [], temperature: '', biomarkers: '', corticoids: '', observations: '' });
    const [prophylaxisData, setProphylaxisData] = useState<ProphylaxisData>({ anticoagulation: '', ibp: '', others: '' });

    const [predictedWeight, setPredictedWeight] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [finalText, setFinalText] = useState('');

    // --- CARREGAR DADOS ---
    useEffect(() => {
        async function init() {
            if (!bedId) return;

            const result = await getPatientFromBed(bedId);
            if (!result.success || !result.patient) {
                alert("Erro: " + result.error);
                router.push('/dashboard');
                return;
            }

            setPatientInfo({
                id: result.patient.id,
                name: result.patient.name,
                bedLabel: result.bedLabel
            });

            setGeneralData(prev => ({
                ...prev,
                sex: result.patient.gender ? result.patient.gender.toLowerCase() : '',
                height: result.patient.height ? result.patient.height.toString() : '',
                weight: result.patient.weight ? result.patient.weight.toString() : ''
            }));

            if (mode === 'copy') {
                const lastEvo = await getLastEvolution(result.patient.id);
                if (lastEvo) populateFromEvolution(lastEvo);
            }

            setIsLoading(false);
        }
        init();
    }, [bedId, mode, router]);

    // Função auxiliar para popular dados (mantida igual, resumida aqui para brevidade)
    const populateFromEvolution = (evo: any) => {
        // ... (seu código de populate aqui permanece idêntico) ...
        // Vou manter o setGeneralData como exemplo, o resto segue a mesma lógica
        setGeneralData(prev => ({
            ...prev,
            height: evo.patient_height?.toString() || '',
            weight: evo.patient_weight?.toString() || '',
        }));
        // ... (restante das funções de populate)
    };

    // --- HANDLERS (Iguais) ---
    const handleGeneralChange = (e: any) => { const { name, value } = e.target; setGeneralData(prev => ({ ...prev, [name]: value })); };
    const handleRespChange = (field: keyof RespiratoryData, value: any) => setRespData(prev => ({ ...prev, [field]: value }));
    const handleNeuroChange = (field: keyof NeurologicalData, value: any) => setNeuroData(prev => ({ ...prev, [field]: value }));
    const handleHemoChange = (field: keyof HemodynamicsData, value: any) => setHemoData(prev => ({ ...prev, [field]: value }));
    const handleNutriChange = (field: keyof NutritionData, value: any) => setNutriData(prev => ({ ...prev, [field]: value }));
    const handleRenalChange = (field: keyof RenalData, value: any) => setRenalData(prev => ({ ...prev, [field]: value }));
    const handleHematoChange = (field: keyof HematoinfectiousData, value: any) => setHematoData(prev => ({ ...prev, [field]: value }));
    const handleProphylaxisChange = (field: keyof ProphylaxisData, value: any) => setProphylaxisData(prev => ({ ...prev, [field]: value }));

    // Peso Predito
    useEffect(() => {
        if (generalData.sex && generalData.height) {
            const h = parseFloat(generalData.height);
            if (h > 100) {
                const pbw = generalData.sex === 'MALE' ? 50 + 0.91 * (h - 152.4) : 45.5 + 0.91 * (h - 152.4);
                setPredictedWeight(pbw.toFixed(2) as unknown as number);
            }
        }
    }, [generalData.sex, generalData.height]);

    // --- GERAÇÃO DE TEXTO ---
    const handleGenerateText = () => {
        const fullData: FormData = {
            general: generalData,
            respiratory: respData,
            neurological: neuroData,
            hemodynamics: hemoData,
            nutrition: nutriData,
            renal: renalData,
            hemato: hematoData,
            prophylaxis: prophylaxisData,
            generatedText: ''
        };
        const text = generateEvolutionText(fullData);
        setFinalText(text);
        setIsSummaryOpen(true);
    };

    // --- SALVAR NO BANCO ---
    const confirmSaveToDatabase = async () => {
        if (!patientInfo || !bedId) return;
        setIsSaving(true);

        const fullData: FormData = {
            general: { ...generalData, weight: generalData.weight },
            generatedText: finalText,
            respiratory: respData,
            neurological: neuroData,
            hemodynamics: hemoData,
            nutrition: nutriData,
            renal: renalData,
            hemato: hematoData,
            prophylaxis: prophylaxisData
        };

        const result = await saveEvolution(fullData, Number(bedId), patientInfo.id);

        if (result.success) {
            alert("Evolução salva com sucesso!");
            router.push(`/dashboard/${bedId}`);
        } else {
            alert("Erro ao salvar: " + result.error);
            setIsSaving(false);
        }
    };

    const handleImportLast = async () => {
        if (!patientInfo) return;
        const lastEvo = await getLastEvolution(patientInfo.id);
        if (lastEvo) {
            populateFromEvolution(lastEvo);
            alert("Dados da última evolução importados!");
        } else {
            alert("Nenhuma evolução anterior encontrada.");
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Carregando dados...</div>;

    const realWeightValue = parseFloat(generalData.weight);
    const calculationWeight = !isNaN(realWeightValue) && realWeightValue > 0 ? realWeightValue : 70;
    const isIntubated = respData.airwayType !== 'fisiologica';

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/${bedId}`} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-500" /></Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Evolução Diária</h1>
                        {patientInfo && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {patientInfo.name}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="flex items-center gap-1"><BedIcon className="w-3 h-3" /> {patientInfo.bedLabel}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleImportLast} className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg text-sm transition-colors">
                        <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Repetir Anterior</span>
                    </button>
                    <button onClick={handleGenerateText} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70">
                        <Save className="w-4 h-4" /> Finalizar
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-6">
                {/* 1. DADOS GERAIS */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-600"><Activity className="w-5 h-5" /><h2 className="font-bold text-slate-800">Dados Gerais</h2></div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-slate-600">Peso Predito (PBW)</label><div className="w-full px-3 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-bold flex items-center">{predictedWeight ? `${predictedWeight} kg` : '-'}</div></div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-600 flex items-center gap-1"><Scale className="w-3 h-3" /> Peso Real (kg)</label>
                                <input type="number" name="weight" value={generalData.weight} onChange={handleGeneralChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="Ex: 70" />
                            </div>
                        </div>
                    </div>
                </section>

                <NeurologicalForm data={neuroData} onChange={handleNeuroChange} patientWeight={calculationWeight} isIntubated={isIntubated} />
                <HemodynamicsForm data={hemoData} onChange={handleHemoChange} patientWeight={calculationWeight} />
                <RespiratoryForm data={respData} onChange={handleRespChange} />
                <NutritionForm data={nutriData} onChange={handleNutriChange} />
                <RenalForm data={renalData} onChange={handleRenalChange} />
                <HematoinfectiousForm data={hematoData} onChange={handleHematoChange} />
                <ProphylaxisForm data={prophylaxisData} onChange={handleProphylaxisChange} />
            </main>

            {/* MODAL DE RESUMO ATUALIZADO */}
            {isSummaryOpen && (
                <EvolutionSummaryModal
                    isOpen={isSummaryOpen}
                    onClose={() => setIsSummaryOpen(false)}
                    generatedText={finalText}
                    onSave={confirmSaveToDatabase} // PASSA A FUNÇÃO
                    isSaving={isSaving}           // PASSA O ESTADO
                />
            )}
            
        </div>
    );
}