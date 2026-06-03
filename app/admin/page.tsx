"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    AlertCircle, Bed, Building2, CheckCircle2, Loader2,
    MapPin, Plus, Trash2, UserMinus, UserPlus,
} from "lucide-react";
import {
    getHospitals,
    createHospital,
    deleteHospital,
    getHospitalStaff,
    assignStaffToHospital,
    removeStaffFromHospital,
    type HospitalData,
    type HospitalStaffMember,
} from "../actions/adminData";

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { type: "success" | "error"; message: string } | null;

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    if (!toast) return null;
    return (
        <aside aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center px-4 z-50">
            <div className={`pointer-events-auto rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 max-w-sm animate-in fade-in slide-in-from-bottom-4 ${toast.type === "success" ? "bg-slate-900 text-white" : "bg-red-600 text-white"
                }`}>
                {toast.type === "success"
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-red-200    shrink-0" />}
                <span className="text-sm font-medium flex-1">{toast.message}</span>
                <button onClick={onClose} className="text-white/60 hover:text-white text-lg font-bold ml-1">×</button>
            </div>
        </aside>
    );
}

const INPUT = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400 disabled:opacity-60";

// ─── Role badges ──────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = { DOCTOR: "Médico", NURSE: "Enfermeiro", MANAGER: "Gestor", ADMIN: "Admin" };
const ROLE_COLORS: Record<string, string> = {
    DOCTOR: "bg-blue-100    text-blue-700    border-blue-200",
    NURSE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    MANAGER: "bg-indigo-100  text-indigo-700  border-indigo-200",
    ADMIN: "bg-amber-100   text-amber-700   border-amber-200",
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 1 — HOSPITAIS
// ═══════════════════════════════════════════════════════════════════════════════

function HospitalSection({ onToast }: { onToast: (msg: string, type?: "success" | "error") => void }) {
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [loading, setLoading] = useState(true);

    // form
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [bedCount, setBedCount] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setHospitals(await getHospitals());
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!name.trim() || !address.trim()) { setFormError("Nome e endereço são obrigatórios."); return; }
        setSubmitting(true);
        const res = await createHospital({
            name: name.trim(), address: address.trim(),
            description: description.trim() || undefined,
            bed_count: bedCount ? Number(bedCount) : null,
        });
        setSubmitting(false);
        if (res.success) {
            setName(""); setAddress(""); setDescription(""); setBedCount("");
            const suffix = bedCount && Number(bedCount) > 0 ? ` com ${bedCount} leitos criados.` : ".";
            onToast(`Hospital cadastrado${suffix}`);
            load();
        } else {
            setFormError(res.error ?? "Erro desconhecido.");
        }
    };

    const handleDelete = async (h: HospitalData) => {
        if (!confirm(`Excluir "${h.name}"? Esta ação não pode ser desfeita.`)) return;
        const res = await deleteHospital(h.id);
        if (res.success) { onToast("Hospital excluído."); load(); }
        else onToast(res.error ?? "Erro ao excluir.", "error");
    };

    return (
        <div className="space-y-6">
            {/* Add form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" /> Adicionar Hospital
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Informe a quantidade de leitos para criá-los automaticamente
                    </p>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                Nome <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                placeholder="Ex: Hospital Regional Norte" className={INPUT} disabled={submitting} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                Endereço <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                                placeholder="Rua, Número — Cidade, UF" className={INPUT} disabled={submitting} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                Descrição <span className="font-normal normal-case text-slate-400">(opcional)</span>
                            </label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                                placeholder="Ex: UTI Adulto" className={INPUT} disabled={submitting} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                Quantidade de Leitos <span className="font-normal normal-case text-slate-400">(cria automaticamente)</span>
                            </label>
                            <input type="number" min="0" max="200" value={bedCount} onChange={e => setBedCount(e.target.value)}
                                placeholder="Ex: 10" className={INPUT} disabled={submitting} />
                        </div>
                    </div>

                    {formError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                        </div>
                    )}

                    <button type="submit" disabled={submitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-200">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {submitting ? "Cadastrando..." : "Cadastrar Hospital"}
                    </button>
                </form>
            </div>

            {/* Hospital list */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">Hospitais Cadastrados</h2>
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5" />
                        {hospitals.reduce((a, h) => a + h.totalBeds, 0)} leitos
                    </span>
                </div>
                <div className="p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                    ) : hospitals.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-slate-400">
                            <Building2 className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">Nenhum hospital cadastrado</p>
                        </div>
                    ) : (
                        hospitals.map(h => {
                            const pct = h.totalBeds > 0 ? Math.round((h.occupiedBeds / h.totalBeds) * 100) : 0;
                            return (
                                <div key={h.id} className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{h.name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                            <MapPin className="w-3 h-3 shrink-0" /> {h.address}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-xs">
                                            <span className="text-slate-600 font-medium">
                                                <span className="text-blue-600 font-bold">{h.occupiedBeds}</span>/{h.totalBeds} ocupados
                                            </span>
                                            {h.totalBeds > 0 && (
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(h)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0" title="Excluir">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 2 — EQUIPE POR HOSPITAL  (página /admin/equipe)
// ═══════════════════════════════════════════════════════════════════════════════

function StaffSection({ onToast }: { onToast: (msg: string, type?: "success" | "error") => void }) {
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [selectedHospId, setSelectedHospId] = useState<number | null>(null);
    const [staff, setStaff] = useState<HospitalStaffMember[]>([]);
    const [loadingHosps, setLoadingHosps] = useState(true);
    const [loadingStaff, setLoadingStaff] = useState(false);

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        getHospitals().then(h => { setHospitals(h); setLoadingHosps(false); });
    }, []);

    const loadStaff = useCallback(async (hospId: number) => {
        setLoadingStaff(true);
        setStaff(await getHospitalStaff(hospId));
        setLoadingStaff(false);
    }, []);

    const handleSelectHospital = (id: number) => {
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
            onToast("Usuário vinculado com sucesso!");
            loadStaff(selectedHospId);
        } else {
            setFormError(res.error ?? "Erro desconhecido.");
        }
    };

    const handleRemove = async (member: HospitalStaffMember) => {
        if (!selectedHospId) return;
        if (!confirm(`Remover "${member.name}" deste hospital?`)) return;
        const res = await removeStaffFromHospital(member.id, selectedHospId);
        if (res.success) { onToast("Usuário removido do hospital."); loadStaff(selectedHospId); }
        else onToast(res.error ?? "Erro ao remover.", "error");
    };

    const selectedHospital = hospitals.find(h => h.id === selectedHospId);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Hospital picker */}
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
                            <p className="text-xs mt-1">Cadastre um hospital na aba anterior.</p>
                        </div>
                    ) : (
                        hospitals.map(h => (
                            <button key={h.id} onClick={() => handleSelectHospital(h.id)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${selectedHospId === h.id
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

            {/* Staff management */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">
                        {selectedHospital ? selectedHospital.name : "Equipe do Hospital"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {selectedHospital
                            ? "Adicione médicos e enfermeiras por e-mail"
                            : "Selecione um hospital à esquerda"}
                    </p>
                </div>

                {!selectedHospital ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <Building2 className="w-10 h-10 mb-3 opacity-40" />
                        <p className="text-sm font-medium text-slate-400">Nenhum hospital selecionado</p>
                    </div>
                ) : (
                    <div className="p-5 space-y-5">
                        {/* Add by email */}
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

                        {/* Current staff */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Equipe Vinculada
                                {staff.length > 0 && <span className="ml-1.5 text-slate-300 font-normal normal-case">({staff.length})</span>}
                            </p>

                            {loadingStaff ? (
                                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                            ) : staff.length === 0 ? (
                                <div className="flex flex-col items-center py-8 text-slate-300 border border-dashed border-slate-200 rounded-xl">
                                    <UserPlus className="w-7 h-7 mb-2" />
                                    <p className="text-xs font-medium text-slate-400">Nenhum membro vinculado</p>
                                    <p className="text-xs text-slate-300 mt-0.5">Use o campo acima para adicionar</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {staff.map(member => (
                                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                                                <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                {ROLE_LABEL[member.role] ?? member.role}
                                            </span>
                                            <button onClick={() => handleRemove(member)} title="Remover do hospital"
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
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE  (rota: /admin — tab "Hospitais")
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminPage() {
    const [toast, setToast] = useState<Toast>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") =>
        setToast({ type, message: msg });

    useEffect(() => {
        if (!toast) return;
        const t = window.setTimeout(() => setToast(null), 3500);
        return () => window.clearTimeout(t);
    }, [toast]);

    return (
        <div className="pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900">Hospitais</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Cadastre e gerencie as unidades hospitalares da rede
                </p>
            </div>

            <HospitalSection onToast={showToast} />
            <ToastNotification toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}
