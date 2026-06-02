"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    AlertCircle, Building2, Loader2, UserMinus, UserPlus,
} from "lucide-react";
import {
    getHospitals,
    getHospitalStaff,
    assignStaffToHospital,
    removeStaffFromHospital,
    type HospitalData,
    type HospitalStaffMember,
} from "../../actions/adminData";

const INPUT = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400 disabled:opacity-60";

const ROLE_LABEL:  Record<string, string> = { DOCTOR: "Médico", NURSE: "Enfermeiro", MANAGER: "Gestor", ADMIN: "Admin" };
const ROLE_COLORS: Record<string, string> = {
    DOCTOR:  "bg-blue-100    text-blue-700    border-blue-200",
    NURSE:   "bg-emerald-100 text-emerald-700 border-emerald-200",
    MANAGER: "bg-indigo-100  text-indigo-700  border-indigo-200",
    ADMIN:   "bg-amber-100   text-amber-700   border-amber-200",
};

export default function EquipePage() {
    const [hospitals,      setHospitals]      = useState<HospitalData[]>([]);
    const [selectedHospId, setSelectedHospId] = useState<number | null>(null);
    const [staff,          setStaff]          = useState<HospitalStaffMember[]>([]);
    const [loadingHosps,   setLoadingHosps]   = useState(true);
    const [loadingStaff,   setLoadingStaff]   = useState(false);

    const [email,      setEmail]      = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError,  setFormError]  = useState<string | null>(null);
    const [toast,      setToast]      = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        getHospitals().then(h => { setHospitals(h); setLoadingHosps(false); });
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const loadStaff = useCallback(async (id: number) => {
        setLoadingStaff(true);
        setStaff(await getHospitalStaff(id));
        setLoadingStaff(false);
    }, []);

    const handleSelect = (id: number) => {
        setSelectedHospId(id);
        setFormError(null);
        setEmail("");
        loadStaff(id);
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHospId || !email.trim()) { setFormError("Selecione um hospital e informe o e-mail."); return; }
        setFormError(null);
        setSubmitting(true);
        const res = await assignStaffToHospital(email.trim(), selectedHospId);
        setSubmitting(false);
        if (res.success) {
            setEmail("");
            setToast({ type: "success", msg: "Usuário vinculado com sucesso!" });
            loadStaff(selectedHospId);
        } else {
            setFormError(res.error ?? "Erro desconhecido.");
        }
    };

    const handleRemove = async (member: HospitalStaffMember) => {
        if (!selectedHospId) return;
        if (!confirm(`Remover "${member.name}" deste hospital?`)) return;
        const res = await removeStaffFromHospital(member.id, selectedHospId);
        if (res.success) {
            setToast({ type: "success", msg: "Usuário removido." });
            loadStaff(selectedHospId);
        } else {
            setToast({ type: "error", msg: res.error ?? "Erro ao remover." });
        }
    };

    const selectedHospital = hospitals.find(h => h.id === selectedHospId);

    return (
        <div className="pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900">Equipe</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Vincule médicos e enfermeiras às unidades hospitalares
                </p>
            </div>

            {/* Inline toast */}
            {toast && (
                <div className={`mb-5 flex items-center gap-2 p-3.5 rounded-xl text-sm font-medium border ${
                    toast.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                }`}>
                    {toast.msg}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left: hospital picker */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">Selecione o Hospital</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Clique para gerenciar a equipe da unidade</p>
                    </div>
                    <div className="p-4 space-y-2">
                        {loadingHosps ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                        ) : hospitals.length === 0 ? (
                            <div className="flex flex-col items-center py-10 text-slate-400">
                                <Building2 className="w-8 h-8 mb-2 opacity-30" />
                                <p className="text-sm font-medium">Nenhum hospital cadastrado</p>
                                <p className="text-xs mt-1">Cadastre na aba "Hospitais" primeiro.</p>
                            </div>
                        ) : (
                            hospitals.map(h => (
                                <button key={h.id} onClick={() => handleSelect(h.id)}
                                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                        selectedHospId === h.id
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-slate-100 hover:border-blue-100 hover:bg-slate-50"
                                    }`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selectedHospId === h.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-bold truncate ${selectedHospId === h.id ? "text-blue-700" : "text-slate-800"}`}>{h.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{h.address}</p>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 shrink-0">{h.totalBeds} leitos</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: staff management */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">
                            {selectedHospital ? selectedHospital.name : "Equipe do Hospital"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {selectedHospital ? "Adicione médicos e enfermeiras por e-mail" : "Selecione um hospital ao lado"}
                        </p>
                    </div>

                    {!selectedHospital ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <Building2 className="w-10 h-10 mb-3 opacity-40" />
                            <p className="text-sm font-medium text-slate-400">Nenhum hospital selecionado</p>
                        </div>
                    ) : (
                        <div className="p-5 space-y-5">
                            {/* Add form */}
                            <form onSubmit={handleAssign} className="space-y-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    Adicionar por E-mail
                                </label>
                                <div className="flex gap-2">
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="enfermeira@hospital.com.br"
                                        className={`${INPUT} flex-1`} disabled={submitting} />
                                    <button type="submit" disabled={submitting || !email.trim()}
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 shadow-md shadow-blue-200">
                                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                                        Adicionar
                                    </button>
                                </div>
                                {formError && (
                                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formError}
                                    </div>
                                )}
                            </form>

                            {/* Staff list */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Equipe Vinculada
                                    {staff.length > 0 && <span className="ml-1.5 font-normal normal-case text-slate-300">({staff.length})</span>}
                                </p>

                                {loadingStaff ? (
                                    <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                                ) : staff.length === 0 ? (
                                    <div className="flex flex-col items-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-300">
                                        <UserPlus className="w-7 h-7 mb-2" />
                                        <p className="text-xs font-medium text-slate-400">Nenhum membro vinculado</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {staff.map(member => (
                                            <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {member.initials}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                                                    <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                    {ROLE_LABEL[member.role] ?? member.role}
                                                </span>
                                                <button onClick={() => handleRemove(member)} title="Desvincular"
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
