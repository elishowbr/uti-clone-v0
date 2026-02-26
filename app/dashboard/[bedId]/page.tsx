// app/dashboard/[bedId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, User, Activity, Calendar, FileText, Plus, Copy,
    Stethoscope, ChevronDown, ChevronUp, Clock, Edit2
} from 'lucide-react';
import { useParams } from 'next/navigation';

import { getBedDetails, savePatientData } from '../../actions/patientData';
import { calculateAge } from './calculateAge';
import PatientEditModal from './PatientEditModal';

// --- Subcomponente: Item do Acordeão ---
const EvolutionItem = ({ evo, isLast }: { evo: any, isLast: boolean }) => {
    const [isOpen, setIsOpen] = useState(isLast);

    return (
        <div className={`bg-white border border-slate-200 transition-all duration-200 ${isOpen ? 'rounded-xl shadow-md ring-1 ring-blue-100 my-4' : 'rounded-lg hover:border-blue-300 mb-2'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left"
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">
                                {new Date(evo.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(evo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    {evo.doctor && (
                        <span className="text-xs font-medium bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100 self-start sm:self-center">
                            Dr(a). {evo.doctor.name}
                        </span>
                    )}
                </div>

                <div className="text-slate-400">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {isOpen && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="border-t border-slate-100 pt-3">
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-lg">
                            {evo.generated_text || "Sem resumo disponível."}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function BedDetailsPage() {
    const params = useParams();
    const bedId = Number(params.bedId);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Função para recarregar dados
    const loadData = async () => {
        if (!bedId) return;
        try {
            // Se você quiser um loading suave ao recarregar, pode controlar aqui
            const result = await getBedDetails(bedId);
            setData(result);
        } catch (error) {
            console.error("Erro ao carregar leito:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [bedId]);

    // Função que passaremos para o Modal
    const handleSavePatient = async (formData: any) => {
        // Chama a Server Action
        await savePatientData(bedId, formData);
        // Recarrega os dados da tela para mostrar as alterações imediatamente
        await loadData();
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Carregando prontuário...</span>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-4">
            <p>Leito não encontrado.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">Voltar para Dashboard</Link>
        </div>
    );

    const patient = data.current_patient;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">

            {/* Modal de Edição Separado */}
            {patient && (
                <PatientEditModal
                    patient={patient}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSavePatient}
                />
            )}

            <div className="max-w-7xl mx-auto">

                {/* --- Header Responsivo --- */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-full transition-all shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                                {data.label || `Leito ${data.bed_number}`}
                                <span className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${data.status === 'OCCUPIED'
                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}>
                                    {data.status === 'OCCUPIED' ? 'Ocupado' : data.status === 'VACANT' ? 'Vago' : 'Higienização'}
                                </span>
                            </h1>
                        </div>
                    </div>
                </header>

                {/* --- Conteúdo Principal --- */}
                {patient ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Coluna Esquerda: Dados e Ações (Ocupa 4/12 colunas no desktop) */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Card do Paciente */}
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 relative group">
                                {/* Botão de Editar */}
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Editar dados do paciente"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                <div className="flex items-start gap-4 mb-6 pr-8">
                                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <User className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 leading-tight mb-1">{patient.name}</h2>
                                        <p className="text-sm font-medium text-slate-500">
                                            {patient.gender === 'MALE' ? 'Masculino' : patient.gender === 'FEMALE' ? 'Feminino' : 'Outro'} • {calculateAge(patient.birth_date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Observações Rápidas</span>
                                        <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                            {patient.commentary || 'Não informado'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>Admissão Hospitalar: {patient.arrival_date ? new Date(patient.arrival_date).toLocaleDateString('pt-BR', { timeZone : 'UTC'}) : '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>Entrada na UTI: {new Date(patient.admission_date).toLocaleDateString('pt-BR', { timeZone : 'UTC'})}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card de Ações */}
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-4">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-500" /> Ações Clínicas
                                </h3>
                                <div className="grid gap-3">
                                    <Link
                                        href={`/dashboard/${bedId}/evolution`}
                                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-blue-100 hover:shadow-lg active:scale-[0.98]"
                                    >
                                        <Plus className="w-5 h-5" /> Nova Evolução
                                    </Link>

                                </div>
                            </div>
                        </div>

                        {/* Coluna Direita: Acordeão de Evoluções */}
                        <div className="lg:col-span-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-slate-500" />
                                    Histórico de Evoluções
                                </h3>
                                <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                                    {patient.evolutions?.length || 0} registros
                                </span>
                            </div>

                            <div className="space-y-1">
                                {(!patient.evolutions || patient.evolutions.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <FileText className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="font-medium">Nenhuma evolução registrada.</p>
                                        <p className="text-sm">Inicie o prontuário clicando em "Nova Evolução".</p>
                                    </div>
                                ) : (
                                    patient.evolutions.map((evo: any, index: number) => (
                                        <EvolutionItem
                                            key={evo.id}
                                            evo={evo}
                                            isLast={index === 0}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                ) : (
                    /* Estado de Leito Vago */
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <User className="w-10 h-10" /><p></p>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Leito Disponível</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Este leito está vago no momento. Volte ao painel principal para realizar a admissão de um novo paciente.
                            </p>
                            <Link href="/dashboard">
                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all">
                                    Voltar ao Painel
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}