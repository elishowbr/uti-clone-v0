'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Loader2,
    Search,
    Stethoscope,
    X,
} from 'lucide-react';
import {
    getDoctorEvolutions,
    type DoctorEvolution,
} from '../../actions/doctorData';
import EvolutionDetailModal from '../components/EvolutionDetailModal';

// ─── Period Filter ────────────────────────────────────────────────────────────

type Period = { label: string; days: number };

const PERIODS: Period[] = [
    { label: 'Hoje', days: 1 },
    { label: '7 dias', days: 7 },
    { label: '30 dias', days: 30 },
    { label: '3 meses', days: 90 },
    { label: 'Tudo', days: 9999 },
];

// ─── Evolution Card ───────────────────────────────────────────────────────────

function EvoCard({ evo, onClick }: { evo: DoctorEvolution; onClick: () => void }) {
    const date = new Date(evo.createdAt);
    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all text-left group"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{evo.patientName}</p>
                        <p className="text-xs text-slate-400">{evo.bedLabel}</p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-500">
                        {date.toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                        {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {isToday && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
                            Hoje
                        </span>
                    )}
                </div>
            </div>

            {/* Preview do texto */}
            {evo.generatedText ? (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 bg-slate-50 rounded-xl p-3">
                    {evo.generatedText}
                </p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {evo.airwayType && (
                        <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100 font-medium">
                            VA: {evo.airwayType}
                        </span>
                    )}
                    {evo.hemodynamicPam && (
                        <span className="text-[11px] bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100 font-medium">
                            PAM: {evo.hemodynamicPam}
                        </span>
                    )}
                    {evo.hemodynamicFc && (
                        <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100 font-medium">
                            FC: {evo.hemodynamicFc}
                        </span>
                    )}
                    {evo.hematoTemperature && (
                        <span className="text-[11px] bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100 font-medium">
                            T°: {evo.hematoTemperature}
                        </span>
                    )}
                    {evo.renalDiuresis && (
                        <span className="text-[11px] bg-cyan-50 text-cyan-600 px-2 py-1 rounded-lg border border-cyan-100 font-medium">
                            Diurese: {evo.renalDiuresis}
                        </span>
                    )}
                </div>
            )}

            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <ClipboardList className="w-3.5 h-3.5" />
                Ver evolução completa
            </div>
        </button>
    );
}

// ─── Timeline Group (by date) ─────────────────────────────────────────────────

function TimelineGroup({ date, evos, onSelect }: {
    date: string;
    evos: DoctorEvolution[];
    onSelect: (evo: DoctorEvolution) => void;
}) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    {date}
                </div>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">
                    {evos.length} evolução{evos.length > 1 ? 'ões' : ''}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {evos.map((evo) => (
                    <EvoCard key={evo.id} evo={evo} onClick={() => onSelect(evo)} />
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export default function MedicoEvolutionsPage() {
    const [evolutions, setEvolutions] = useState<DoctorEvolution[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [periodDays, setPeriodDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [selectedEvo, setSelectedEvo] = useState<DoctorEvolution | null>(null);

    const load = useCallback(async (p: number, s: string, d: number) => {
        setLoading(true);
        try {
            const { data, total: t } = await getDoctorEvolutions(p, s, d);
            setEvolutions(data);
            setTotal(t);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(page, search, periodDays);
    }, [page, search, periodDays, load]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Group evolutions by date
    const grouped = evolutions.reduce<Record<string, DoctorEvolution[]>>((acc, evo) => {
        const key = new Date(evo.createdAt).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
        if (!acc[key]) acc[key] = [];
        acc[key].push(evo);
        return acc;
    }, {});

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Histórico de Evoluções</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Todas as evoluções clínicas registradas por você
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome do paciente..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    {searchInput && (
                        <button
                            onClick={() => { setSearchInput(''); }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Period Filter */}
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.days}
                            onClick={() => { setPeriodDays(p.days); setPage(1); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                                periodDays === p.days
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>



            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Carregando evoluções...</span>
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-semibold text-slate-600">Nenhuma evolução encontrada</p>
                    <p className="text-sm mt-1">
                        {search
                            ? 'Tente outro termo de busca ou período diferente'
                            : 'Você ainda não registrou evoluções neste período'}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([date, evos]) => (
                        <TimelineGroup
                            key={date}
                            date={date}
                            evos={evos}
                            onSelect={setSelectedEvo}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                    <span className="text-sm text-slate-500">
                        Página <span className="font-bold text-slate-800">{page}</span> de{' '}
                        <span className="font-bold text-slate-800">{totalPages}</span>
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Próxima <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Modal */}
            <EvolutionDetailModal
                evolution={selectedEvo}
                onClose={() => setSelectedEvo(null)}
            />
        </div>
    );
}
