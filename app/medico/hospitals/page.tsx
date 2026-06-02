'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity, AlertCircle, Building2, CheckCircle2,
    Loader2, MapPin, Search, Users, X, LayoutDashboard, AlertTriangle
} from 'lucide-react';

// ─── Tipagens e Dados Mockados ────────────────────────────────

export type HospitalStatus = 'stable' | 'warning' | 'critical';

export interface Hospital {
    id: string;
    name: string;
    location: string;
    totalBeds: number;
    availableBeds: number;
    status: HospitalStatus;
    lastUpdate: string;
    alertMessage?: string;
}

// Simulando uma chamada de API
const fetchHospitals = async (): Promise<Hospital[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 'hosp-01',
                    name: 'Hospital Moinhos de Vento',
                    location: 'Porto Alegre, RS',
                    totalBeds: 15,
                    availableBeds: 12,
                    status: 'stable',
                    lastUpdate: new Date().toISOString(),
                },
                {
                    id: 'hosp-02',
                    name: 'Hospital Sírio-Libanês',
                    location: 'São Paulo, SP',
                    totalBeds: 20,
                    availableBeds: 5,
                    status: 'warning',
                    lastUpdate: new Date(Date.now() - 3600000).toISOString(),
                    alertMessage: 'Ocupação da UTI Adulto acima de 90%.',
                },
                {
                    id: 'hosp-03',
                    name: 'Hospital de Base',
                    location: 'Brasília, DF',
                    totalBeds: 10,
                    availableBeds: 0,
                    status: 'critical',
                    lastUpdate: new Date(Date.now() - 7200000).toISOString(),
                    alertMessage: 'Lotação máxima atingida. Desvios de ambulância ativos.',
                }
            ]);
        }, 800);
    });
};

// ─── Hospital Card ────────────────────────────────────────────

function HospitalCard({
    hospital,
    onSelect,
}: {
    hospital: Hospital;
    onSelect: () => void;
}) {
    const lastUpdateDate = new Date(hospital.lastUpdate);

    const statusConfig = {
        stable: {
            icon: 'bg-emerald-100 text-emerald-600',
            badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        },
        warning: {
            icon: 'bg-amber-100 text-amber-600',
            badge: 'bg-amber-100 text-amber-700 border-amber-200',
        },
        critical: {
            icon: 'bg-rose-100 text-rose-600',
            badge: 'bg-rose-100 text-rose-700 border-rose-200',
        }
    };

    const currentStatus = statusConfig[hospital.status];

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-blue-100 hover:shadow-sm transition-all">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentStatus.icon}`}>
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{hospital.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {hospital.location}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Info */}
            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Leitos Disponíveis</p>
                    <p className="text-sm font-bold text-slate-700">
                        <span className={hospital.availableBeds === 0 ? 'text-rose-600' : 'text-blue-600'}>
                            {hospital.availableBeds}
                        </span> 
                        <span className="text-slate-400 font-medium"> / {hospital.totalBeds}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Atualização</p>
                    <p className="text-xs text-slate-600 font-medium">
                        {lastUpdateDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onSelect}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Acessar Dashboard
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────

export default function HospitalSelectionPage() {
    const router = useRouter();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchHospitals()
            .then(setHospitals)
            .finally(() => setLoading(false));
    }, []);

    const filtered = hospitals.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) || 
        h.location.toLowerCase().includes(search.toLowerCase())
    );

    const stableCount = hospitals.filter(h => h.status === 'stable').length;
    const warningCriticalCount = hospitals.filter(h => h.status !== 'stable').length;

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Rede Hospitalar</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Selecione uma unidade para acessar o painel de controle e gestão de leitos
                </p>
            </div>


            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar unidade por nome ou localização..."
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
                    <span className="text-sm">Carregando rede hospitalar...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <Building2 className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-semibold text-slate-600">
                        {search ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
                    </p>
                    <p className="text-sm mt-1">
                        {search ? 'Tente outro termo de busca' : 'Sua rede hospitalar está vazia.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(h => (
                        <HospitalCard
                            key={h.id}
                            hospital={h}
                            onSelect={() => router.push(`/hospital/${h.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}