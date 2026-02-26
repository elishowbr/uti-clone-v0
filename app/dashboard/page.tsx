'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bed, Users, Activity, UserPlus, LogOut, Plus, Stethoscope, Sparkles, Trash2, MoreVertical, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getDashboardData, createBed, admitPatient, dischargePatient, finishCleaning, setBedToCleaning, deleteBed } from '../actions/bedManagement';

// --- Modal de Admissão (Mantido igual) ---
const AdmissionModal = ({ isOpen, onClose, onConfirm }: any) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Admitir Paciente
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Nome do Paciente</label>
                <input
                    ref={inputRef}
                    className="w-full mb-8 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Ex: João da Silva..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onConfirm(name); }}
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(name)}
                        disabled={!name.trim()}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-lg shadow-blue-200 disabled:shadow-none transition-all font-bold text-sm"
                    >
                        Confirmar Internação
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const [beds, setBeds] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'OCCUPIED' | 'VACANT' | 'CLEANING'>('all');
    const [isAdmittingId, setIsAdmittingId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const router = useRouter();

    const loadData = async () => {
        try {
            const data = await getDashboardData();
            setBeds(data);
        } catch (error) {
            console.error("Erro ao carregar:", error);
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- Handlers ---
    const handleCreateBed = async () => {
        const nextNum = beds.length > 0 ? Math.max(...beds.map(b => b.bed_number)) + 1 : 1;
        await createBed(nextNum);
        loadData();
    };

    const handleAdmitConfirm = async (name: string) => {
        if (isAdmittingId) {
            await admitPatient(isAdmittingId, name);
            setIsAdmittingId(null);
            loadData();
        }
    };

    const handleDischarge = async (bedId: number) => {
        if (confirm("Confirmar alta? O leito entrará em status de limpeza.")) {
            await dischargePatient(bedId);
            loadData();
        }
    };

    const handleFinishCleaning = async (bedId: number) => {
        await finishCleaning(bedId);
        loadData();
    };

    const handleSetCleaning = async (bedId: number) => {
        setOpenMenuId(null);
        await setBedToCleaning(bedId);
        loadData();
    };

    const handleDeleteBed = async (bedId: number) => {
        setOpenMenuId(null);
        if (confirm("Tem certeza que deseja EXCLUIR este leito permanentemente?")) {
            const result = await deleteBed(bedId);
            if (result.success) loadData();
            else alert(result.error);
        }
    };

    const handleEvolve = (bedId: number) => {
        router.push(`/dashboard/${bedId}`);
    };

    // --- Helpers de UI ---
    const getStatusConfig = (status: string) => {
        const map: any = {
            'VACANT': { label: 'Disponível', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: UserPlus },
            'OCCUPIED': { label: 'Ocupado', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Users },
            'CLEANING': { label: 'Higienização', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Sparkles }
        };
        return map[status] || { label: status, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Bed };
    };

    // Lógica de Filtro Simplificada (Sem busca textual)
    const filteredBeds = filterStatus === 'all'
        ? beds
        : null;

    const stats = {
        occupied: beds.filter(b => b.status === 'OCCUPIED').length,
        available: beds.filter(b => b.status === 'VACANT').length,
        cleaning: beds.filter(b => b.status === 'CLEANING').length
    };
    const occupancyRate = beds.length > 0 ? Math.round((stats.occupied / beds.length) * 100) : 0;

    return (
        <div
            className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900"
            onClick={() => setOpenMenuId(null)}
        >
            <div className="max-w-7xl mx-auto">
                {/* --- Header --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Controle UTI</h1>
                        <p className="text-slate-500 text-sm">Visão geral da ocupação e status em tempo real</p>
                    </div>
                    <button
                        onClick={handleCreateBed}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95 font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" /> Adicionar Leito
                    </button>
                </div>

                {/* --- Stats Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-100 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Ocupação</p>
                            <h2 className="text-4xl font-extrabold text-slate-800">{occupancyRate}<span className="text-xl text-slate-400">%</span></h2>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Activity className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-100 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Leitos Livres</p>
                            <h2 className="text-4xl font-extrabold text-emerald-600">{stats.available}</h2>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Bed className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pacientes Internados</p>
                            <h2 className="text-4xl font-extrabold text-indigo-600">{stats.occupied}</h2>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* --- Toolbar: Apenas Filtros --- */}
                <div className="mb-8 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                    <div className="flex p-1 gap-1 overflow-x-auto w-full">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'OCCUPIED', label: 'Ocupados' },
                            { id: 'VACANT', label: 'Livres' },
                            { id: 'CLEANING', label: 'Higienização' }
                        ].map((status) => (
                            <button
                                key={status.id}
                                onClick={() => setFilterStatus(status.id as any)}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${filterStatus === status.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Grid de Leitos --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                    {filteredBeds?.map((bed) => {
                        const config = getStatusConfig(bed.status);
                        const StatusIcon = config.icon;

                        return (
                            <div
                                key={bed.id}
                                onClick={(e) => e.stopPropagation()}
                                className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group ${bed.status === 'OCCUPIED' ? 'border-blue-100 hover:border-blue-200' :
                                    bed.status === 'CLEANING' ? 'border-amber-100 hover:border-amber-200' :
                                        'border-emerald-100 hover:border-emerald-200'
                                    }`}
                            >
                                {/* Header do Card */}
                                <div className={`px-5 py-4 flex justify-between items-center rounded-t-2xl border-b ${bed.status === 'OCCUPIED' ? 'bg-blue-50/50 border-blue-50' :
                                    bed.status === 'CLEANING' ? 'bg-amber-50/50 border-amber-50' :
                                        'bg-emerald-50/50 border-emerald-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white shadow-sm ${config.color}`}>
                                            <Bed className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-700 text-lg">{bed.label || `Leito ${bed.bed_number}`}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${config.color} ${config.bg} ${config.border}`}>
                                        {config.label}
                                    </span>
                                </div>

                                {/* Corpo do Card */}
                                <div className="p-6 h-36 flex flex-col justify-center relative">
                                    {bed.status === 'OCCUPIED' ? (
                                        <div className="space-y-3 animate-in fade-in">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paciente</div>
                                                <div className="text-xl font-bold text-slate-800 truncate leading-tight" title={bed.current_patient?.name}>
                                                    {bed.current_patient?.name || 'Nome não registrado'}
                                                </div>
                                            </div>
                                            {bed.clinical_evolutions && bed.clinical_evolutions.length > 0 && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg w-fit">
                                                    <Stethoscope className="w-3 h-3 text-blue-500" />
                                                    <span className="truncate">Ult. Evol: {new Date(bed.clinical_evolutions[0].created_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-3 animate-in fade-in">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${config.bg}`}>
                                                <StatusIcon className={`w-7 h-7 ${config.color}`} />
                                            </div>
                                            <span className={`text-sm font-semibold ${config.color}`}>
                                                {bed.status === 'CLEANING' ? 'Leito em Higienização' : 'Leito Disponível'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer com Ações */}
                                <div className="p-4 border-t border-slate-50 bg-white rounded-b-2xl flex gap-3 relative z-0">
                                    {bed.status === 'OCCUPIED' ? (
                                        <>
                                            <button
                                                onClick={() => handleEvolve(bed.id)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-100 hover:shadow-lg"
                                            >
                                                <Activity className="w-4 h-4" /> Evoluir
                                            </button>
                                            <button
                                                onClick={() => handleDischarge(bed.id)}
                                                className="px-3 py-2 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all"
                                                title="Realizar Alta"
                                            >
                                                <LogOut className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : bed.status === 'CLEANING' ? (
                                        <button
                                            onClick={() => handleFinishCleaning(bed.id)}
                                            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-100 hover:shadow-lg"
                                        >
                                            <Sparkles className="w-4 h-4" /> Finalizar Higienização
                                        </button>
                                    ) : (
                                        // VACANT
                                        <>
                                            <button
                                                onClick={() => setIsAdmittingId(bed.id)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100 hover:shadow-lg"
                                            >
                                                <UserPlus className="w-4 h-4" /> Admitir Paciente
                                            </button>

                                            {/* Botão Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === bed.id ? null : bed.id);
                                                    }}
                                                    className={`h-full px-3 flex items-center justify-center border rounded-xl transition-all ${openMenuId === bed.id
                                                        ? 'bg-slate-100 border-slate-300 text-slate-800'
                                                        : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                        }`}
                                                >
                                                    {openMenuId === bed.id ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
                                                </button>

                                                {/* MENU SUSPENSO */}
                                                {openMenuId === bed.id && (
                                                    <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl shadow-slate-200 border border-slate-100 z-20 animate-in fade-in zoom-in-95 origin-bottom-right p-1.5">
                                                        <div className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">Opções do Leito</div>
                                                        <button
                                                            onClick={() => handleSetCleaning(bed.id)}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-left"
                                                        >
                                                            <Sparkles className="w-4 h-4" /> Higienização
                                                        </button>
                                                        <div className="h-px bg-slate-100 my-1"></div>
                                                        <button
                                                            onClick={() => handleDeleteBed(bed.id)}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-left"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Excluir Leito
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AdmissionModal
                isOpen={!!isAdmittingId}
                onClose={() => setIsAdmittingId(null)}
                onConfirm={handleAdmitConfirm}
            />
        </div>
    );
}