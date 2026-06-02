'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity, AlertCircle, CheckCircle2, ClipboardList,
    Loader2, MessageSquare, Search, Stethoscope, Users, X,
} from 'lucide-react';
import {
    getAllUtiPatients,
    type UtiPatient,
    type DoctorEvolution,
} from '../../actions/doctorData';
import EvolutionDetailModal from '../components/EvolutionDetailModal';

// ─── Patient Card ─────────────────────────────────────────────

function PatientCard({
    patient,
    onEvolve,
    onViewLastEvo,
}: {
    patient: UtiPatient;
    onEvolve: () => void;
    onViewLastEvo: () => void;
}) {
    const lastEvo = patient.lastEvolutionAt ? new Date(patient.lastEvolutionAt) : null;

    const statusColor = patient.evolvedTodayByCurrentDoctor
        ? 'bg-emerald-100 text-emerald-600'
        : 'bg-amber-100 text-amber-600';

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-blue-100 hover:shadow-sm transition-all">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusColor}`}>
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{patient.name}</p>
                        <p className="text-xs text-slate-500">
                            {patient.bedLabel} &middot; {patient.daysInUTI} dia{patient.daysInUTI > 1 ? 's' : ''} de UTI
                        </p>
                    </div>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${
                    patient.evolvedTodayByCurrentDoctor
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                    {patient.evolvedTodayByCurrentDoctor ? 'Evoluído Hoje' : 'Pendente'}
                </span>
            </div>

            {/* Nursing commentary */}
            {patient.commentary && (
                <div className="flex items-start gap-2 mb-3 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed line-clamp-2">{patient.commentary}</p>
                </div>
            )}

            {/* Last evolution info */}
            {patient.lastEvolutionAt ? (
                <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Última Evolução</p>
                    <p className="text-xs text-slate-600 font-medium">
                        {lastEvo?.toLocaleDateString('pt-BR')} às{' '}
                        {lastEvo?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {patient.lastDoctorName && (
                            <span className="text-slate-400"> &middot; {patient.lastDoctorName}</span>
                        )}
                    </p>
                    {patient.lastEvolutionText && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {patient.lastEvolutionText.slice(0, 120)}...
                        </p>
                    )}
                </div>
            ) : (
                <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 italic">Sem evoluções registradas ainda.</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onEvolve}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                    <Activity className="w-3.5 h-3.5" /> Evoluir Paciente
                </button>
                {patient.lastEvolutionAt && (
                    <button
                        onClick={onViewLastEvo}
                        className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors"
                    >
                        <ClipboardList className="w-3.5 h-3.5" /> Ver Evolução
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────

export default function MedicoPatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<UtiPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedEvo, setSelectedEvo] = useState<DoctorEvolution | null>(null);

    useEffect(() => {
        getAllUtiPatients()
            .then(setPatients)
            .finally(() => setLoading(false));
    }, []);

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const pending = patients.filter(p => !p.evolvedTodayByCurrentDoctor).length;
    const evolved = patients.filter(p => p.evolvedTodayByCurrentDoctor).length;

    // Build a minimal DoctorEvolution object from UtiPatient for the modal
    const buildEvoPreview = (p: UtiPatient): DoctorEvolution => ({
        id: 0,
        patientId: p.id,
        patientName: p.name,
        bedLabel: p.bedLabel,
        createdAt: p.lastEvolutionAt ?? new Date().toISOString(),
        generatedText: p.lastEvolutionText,
        airwayType: null, respiratorySupport: null, respiratorySpo2: null,
        neurologicSedation: null, neurologicScales: null,
        hemodynamicDrugs: null, hemodynamicPam: null, hemodynamicFc: null,
        renalDialysis: null, renalDiuresis: null, nutritionSupport: null,
        hematoAntibiotics: null, hematoTemperature: null,
        prophylaxisTev: null, prophylaxisIbp: null,
    });

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Meus Pacientes</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Todos os pacientes internados na UTI — relatório clínico em tempo real
                </p>
            </div>

            {/* Status Summary */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Pendentes hoje</p>
                            <p className="text-2xl font-extrabold text-amber-600">{pending}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Evoluídos hoje</p>
                            <p className="text-2xl font-extrabold text-emerald-600">{evolved}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total internados</p>
                            <p className="text-2xl font-extrabold text-indigo-600">{patients.length}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar paciente por nome..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Carregando pacientes da UTI...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <Users className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-semibold text-slate-600">
                        {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente internado no momento'}
                    </p>
                    <p className="text-sm mt-1">
                        {search ? 'Tente outro termo de busca' : 'A UTI está vazia.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(p => (
                        <PatientCard
                            key={p.id}
                            patient={p}
                            onEvolve={() => router.push(`/dashboard/${p.bedId}`)}
                            onViewLastEvo={() => p.lastEvolutionAt && setSelectedEvo(buildEvoPreview(p))}
                        />
                    ))}
                </div>
            )}

            <EvolutionDetailModal
                evolution={selectedEvo}
                onClose={() => setSelectedEvo(null)}
            />
        </div>
    );
}
