'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Bed, Users, Activity, UserPlus, LogOut, Plus, Stethoscope,
    Sparkles, Trash2, MoreVertical, X, ArrowLeft, Loader2, ClipboardList,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    getDashboardData, createBed, admitPatient,
    dischargePatient, finishCleaning, setBedToCleaning, deleteBed,
} from '../actions/bedManagement';
import { getDoctorProfile, getCurrentUserRole } from '../actions/adminData';
import UserProfileDropdown from '../components/UserProfileDropdown';
import PatientDetailModal from './components/PatientDetailModal';

// ─────────────────────────────────────────────────────────────
// TASK 1 FIX: isLoading prop prevents double-submit
// TASK 2 FIX: bottom-sheet on mobile (slide-in-from-bottom)
// ─────────────────────────────────────────────────────────────
const AdmissionModal = ({
    isOpen, onClose, onConfirm, isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, commentary: string) => void;
    isLoading: boolean;
}) => {
    const [name, setName] = useState('');
    const [commentary, setCommentary] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setCommentary('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!name.trim() || isLoading) return;
        onConfirm(name.trim(), commentary.trim());
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
            {/* bottom-sheet on mobile, centered dialog on sm+ */}
            <div className="bg-white p-6 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md mx-0 sm:mx-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Admitir Paciente
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                    Nome do Paciente
                </label>
                <input
                    ref={inputRef}
                    className="w-full mb-8 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Ex: João da Silva..."
                    value={name}
                    disabled={isLoading}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
                />

                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide mt-4">
                    Diagnóstico Inicial / Sintomas
                </label>
                <textarea
                    className="w-full mb-8 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400 min-h-[100px]"
                    placeholder="O que o paciente está sentindo? Descreva o quadro..."
                    value={commentary}
                    disabled={isLoading}
                    onChange={e => setCommentary(e.target.value)}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium text-sm disabled:opacity-40"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!name.trim() || isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-lg shadow-blue-200 disabled:shadow-none transition-all font-bold text-sm"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Internando...' : 'Confirmar Internação'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [beds, setBeds] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'OCCUPIED' | 'VACANT' | 'CLEANING'>('all');
    const [isAdmittingId, setIsAdmittingId] = useState<number | null>(null);
    const [isAdmitting, setIsAdmitting] = useState(false); // TASK 1: guard
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [detailBedId, setDetailBedId] = useState<number | null>(null); // TASK 2: Detail modal
    const [profile, setProfile] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null); // TASK 3
    const router = useRouter();

    const loadData = async () => {
        try {
            const [data, prof, role] = await Promise.all([
                getDashboardData(),
                getDoctorProfile(),
                getCurrentUserRole(),
            ]);
            setBeds(data);
            setProfile(prof);
            setUserRole(role);
        } catch (error) {
            console.error('Erro ao carregar:', error);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ── TASK 1 FIX: guard prevents double-submit ──────────────
    const handleAdmitConfirm = async (name: string, commentary: string) => {
        if (isAdmitting || !isAdmittingId || !name.trim()) return;
        setIsAdmitting(true);
        try {
            await admitPatient(isAdmittingId, name, commentary);
            setIsAdmittingId(null);
            await loadData();
        } catch (err) {
            console.error('Erro na admissão:', err);
        } finally {
            setIsAdmitting(false);
        }
    };

    const handleCreateBed = async () => {
        const nextNum = beds.length > 0 ? Math.max(...beds.map(b => b.bed_number)) + 1 : 1;
        await createBed(nextNum);
        loadData();
    };

    const handleDischarge = async (bedId: number) => {
        if (confirm('Confirmar alta? O leito entrará em status de limpeza.')) {
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
        if (confirm('Tem certeza que deseja EXCLUIR este leito permanentemente?')) {
            const result = await deleteBed(bedId);
            if (result.success) loadData();
            else alert(result.error);
        }
    };

    const handleEvolve = (bedId: number) => router.push(`/dashboard/${bedId}`);

    const getStatusConfig = (status: string) => {
        const map: any = {
            VACANT: { label: 'Disponível', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: UserPlus },
            OCCUPIED: { label: 'Ocupado', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Users },
            CLEANING: { label: 'Higienização', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Sparkles },
        };
        return map[status] || { label: status, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Bed };
    };

    const filteredBeds = filterStatus === 'all' ? beds : beds.filter(b => b.status === filterStatus);
    const stats = {
        occupied: beds.filter(b => b.status === 'OCCUPIED').length,
        available: beds.filter(b => b.status === 'VACANT').length,
        cleaning: beds.filter(b => b.status === 'CLEANING').length,
    };
    const occupancyRate = beds.length > 0 ? Math.round((stats.occupied / beds.length) * 100) : 0;

    return (
        <div
            className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-900"
            onClick={() => setOpenMenuId(null)}
        >
            <div className="max-w-7xl mx-auto">

                {/* ── TASK 3: Back-to-panel banner for DOCTOR role ── */}
                {userRole === 'DOCTOR' && (
                    <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                        <Stethoscope className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-blue-700 font-medium flex-1">
                            Você está visualizando o mapa de leitos.
                        </span>
                        <Link
                            href="/medico"
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold whitespace-nowrap transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Painel
                        </Link>
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Controle UTI</h1>
                        <p className="text-slate-500 text-sm">Visão geral da ocupação e status em tempo real</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {userRole === 'MANAGER' && (
                            <button
                                onClick={handleCreateBed}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95 font-medium text-sm"
                            >
                                <Plus className="w-4 h-4" /> Adicionar Leito
                            </button>
                        )}
                        <div className="pl-3 border-l border-slate-200">
                            <UserProfileDropdown profile={profile} />
                        </div>
                    </div>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-100 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Ocupação</p>
                            <h2 className="text-4xl font-extrabold text-slate-800">{occupancyRate}<span className="text-xl text-slate-400">%</span></h2>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Activity className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-100 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Leitos Livres</p>
                            <h2 className="text-4xl font-extrabold text-emerald-600">{stats.available}</h2>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Bed className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pacientes Internados</p>
                            <h2 className="text-4xl font-extrabold text-indigo-600">{stats.occupied}</h2>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* ── Filter Bar ── */}
                <div className="mb-6 sm:mb-8 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-fit overflow-x-auto">
                    <div className="flex p-1 gap-1 min-w-max">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'OCCUPIED', label: 'Ocupados' },
                            { id: 'VACANT', label: 'Livres' },
                            { id: 'CLEANING', label: 'Higienização' },
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setFilterStatus(s.id as any)}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${filterStatus === s.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── TASK 2: Responsive Bed Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-20">
                    {filteredBeds?.map(bed => {
                        const config = getStatusConfig(bed.status);
                        const StatusIcon = config.icon;

                        return (
                            <div
                                key={bed.id}
                                onClick={e => e.stopPropagation()}
                                className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative group ${bed.status === 'OCCUPIED'
                                    ? 'border-blue-100 hover:border-blue-200'
                                    : bed.status === 'CLEANING'
                                        ? 'border-amber-100 hover:border-amber-200'
                                        : 'border-emerald-100 hover:border-emerald-200'
                                }`}
                            >
                                {/* Card Header */}
                                <div className={`px-4 sm:px-5 py-4 flex justify-between items-center rounded-t-2xl border-b ${bed.status === 'OCCUPIED'
                                    ? 'bg-blue-50/50 border-blue-50'
                                    : bed.status === 'CLEANING'
                                        ? 'bg-amber-50/50 border-amber-50'
                                        : 'bg-emerald-50/50 border-emerald-50'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white shadow-sm ${config.color}`}>
                                            <Bed className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-700 text-base sm:text-lg">{bed.label || `Leito ${bed.bed_number}`}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${config.color} ${config.bg} ${config.border}`}>
                                        {config.label}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div 
                                    className={`p-5 sm:p-6 h-32 sm:h-36 flex flex-col justify-center relative ${bed.status === 'OCCUPIED' ? 'cursor-pointer' : ''}`}
                                    onClick={() => { if (bed.status === 'OCCUPIED') setDetailBedId(bed.id); }}
                                >
                                    {bed.status === 'OCCUPIED' ? (
                                        <div className="space-y-3 animate-in fade-in group-hover:scale-[1.02] transition-transform">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paciente</div>
                                                <div className="text-lg sm:text-xl font-bold text-slate-800 truncate" title={bed.current_patient?.name}>
                                                    {bed.current_patient?.name || 'Nome não registrado'}
                                                </div>
                                            </div>
                                            {bed.clinical_evolutions?.length > 0 && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg w-fit">
                                                    <Stethoscope className="w-3 h-3 text-blue-500" />
                                                    <span className="truncate">Ult. Evol: {new Date(bed.clinical_evolutions[0].created_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-3 animate-in fade-in">
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${config.bg}`}>
                                                <StatusIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${config.color}`} />
                                            </div>
                                            <span className={`text-sm font-semibold ${config.color}`}>
                                                {bed.status === 'CLEANING' ? 'Leito em Higienização' : 'Leito Disponível'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer Actions */}
                                <div className="p-3 sm:p-4 border-t border-slate-50 bg-white rounded-b-2xl flex gap-2 sm:gap-3 relative z-0">
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
                                            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-100"
                                        >
                                            <Sparkles className="w-4 h-4" /> Finalizar Higienização
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsAdmittingId(bed.id)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100"
                                            >
                                                <UserPlus className="w-4 h-4" /> Admitir
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={e => {
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
                                                {openMenuId === bed.id && (
                                                    <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-20 animate-in fade-in zoom-in-95 origin-bottom-right p-1.5">
                                                        <div className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">Opções do Leito</div>
                                                        <button
                                                            onClick={() => handleSetCleaning(bed.id)}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-left"
                                                        >
                                                            <Sparkles className="w-4 h-4" /> Higienização
                                                        </button>
                                                        {userRole === 'MANAGER' && (
                                                            <>
                                                                <div className="h-px bg-slate-100 my-1" />
                                                                <button
                                                                    onClick={() => handleDeleteBed(bed.id)}
                                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-left"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Excluir Leito
                                                                </button>
                                                            </>
                                                        )}
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
                onClose={() => { if (!isAdmitting) setIsAdmittingId(null); }}
                onConfirm={handleAdmitConfirm}
                isLoading={isAdmitting}
            />

            <PatientDetailModal
                bed={beds.find(b => b.id === detailBedId)}
                userRole={userRole}
                userId={profile?.id || null}
                onClose={() => setDetailBedId(null)}
                onRefresh={loadData}
            />
        </div>
    );
}