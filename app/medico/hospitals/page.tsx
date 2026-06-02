'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, LayoutDashboard, Loader2, MapPin, Search, X } from 'lucide-react';
import { getDoctorHospitals, type DoctorHospital } from '../../actions/doctorData';

function statusFromOccupancy(total: number, occupied: number): 'stable' | 'warning' | 'critical' {
    if (total === 0) return 'stable';
    const pct = (occupied / total) * 100;
    if (pct >= 90) return 'critical';
    if (pct >= 70) return 'warning';
    return 'stable';
}

const STATUS_COLORS = {
    stable: { icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    warning: { icon: 'bg-amber-100 text-amber-600', bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    critical: { icon: 'bg-rose-100 text-rose-600', bar: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
};
const STATUS_LABELS = { stable: 'Normal', warning: 'Atenção', critical: 'Crítico' };

function HospitalCard({ hospital, onSelect }: { hospital: DoctorHospital; onSelect: () => void }) {
    const status = statusFromOccupancy(hospital.totalBeds, hospital.occupiedBeds);
    const colors = STATUS_COLORS[status];
    const occupancyPct = hospital.totalBeds > 0
        ? Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100)
        : 0;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-blue-100 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{hospital.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{hospital.address}</span>
                        </p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${colors.badge}`}>
                    {STATUS_LABELS[status]}
                </span>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                    <span>Ocupação</span>
                    <span className="font-bold">{hospital.occupiedBeds}/{hospital.totalBeds} leitos</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${colors.bar}`}
                        style={{ width: `${occupancyPct}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>{hospital.vacantBeds} livres</span>
                    <span>{occupancyPct}% ocupado</span>
                </div>
            </div>

            <button
                onClick={onSelect}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
                <LayoutDashboard className="w-3.5 h-3.5" /> Acessar Dashboard
            </button>
        </div>
    );
}

export default function MedicoHospitalsPage() {
    const router = useRouter();
    const [hospitals, setHospitals] = useState<DoctorHospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getDoctorHospitals().then(setHospitals).finally(() => setLoading(false));
    }, []);

    const filtered = hospitals.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Rede Hospitalar</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Selecione uma unidade para acessar o painel de controle e gestão de leitos
                </p>
            </div>

            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou endereço..."
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
                        {search ? 'Tente outro termo de busca.' : 'Solicite ao gestor para cadastrar unidades.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(h => (
                        <HospitalCard
                            key={h.id}
                            hospital={h}
                            onSelect={() => router.push(`/${h.id}/dashboard`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
