"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    AlertCircle, Bed, Building2, CheckCircle2, Loader2,
    MapPin, Plus, Trash2, Edit2, Save, X
} from "lucide-react";
import {
    getHospitals,
    createHospital,
    deleteHospital,
    updateHospital,
    type HospitalData,
} from "../../actions/adminData";

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

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 1 — HOSPITAIS
// ═══════════════════════════════════════════════════════════════════════════════

function HospitalSection({ onToast }: { onToast: (msg: string, type?: "success" | "error") => void }) {
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [loading, setLoading] = useState(true);

    // form (create / edit)
    const [isEditing, setIsEditing] = useState<number | null>(null);
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

    const resetForm = () => {
        setIsEditing(null);
        setName("");
        setAddress("");
        setDescription("");
        setBedCount("");
        setFormError(null);
    };

    const handleEditClick = (h: HospitalData) => {
        // Fetch description if needed, or we might need to update HospitalData type.
        // For now, we will use an empty description as we don't return it in HospitalData currently.
        // If we want to support description, we should update getHospitals to return it.
        setIsEditing(h.id);
        setName(h.name);
        setAddress(h.address);
        setDescription(""); // Since description is not in HospitalData by default, we start empty
        setBedCount(""); // We don't allow editing bed count, so keep it empty
        setFormError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!name.trim() || !address.trim()) { setFormError("Nome e endereço são obrigatórios."); return; }
        setSubmitting(true);
        
        if (isEditing) {
            const res = await updateHospital(isEditing, {
                name: name.trim(), address: address.trim(),
                description: description.trim() || undefined,
            });
            setSubmitting(false);
            if (res.success) {
                resetForm();
                onToast(`Hospital atualizado com sucesso.`);
                load();
            } else {
                setFormError(res.error ?? "Erro desconhecido.");
            }
        } else {
            const res = await createHospital({
                name: name.trim(), address: address.trim(),
                description: description.trim() || undefined,
                bed_count: bedCount ? Number(bedCount) : null,
            });
            setSubmitting(false);
            if (res.success) {
                resetForm();
                const suffix = bedCount && Number(bedCount) > 0 ? ` com ${bedCount} leitos criados.` : ".";
                onToast(`Hospital cadastrado${suffix}`);
                load();
            } else {
                setFormError(res.error ?? "Erro desconhecido.");
            }
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
            {/* Add/Edit form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            {isEditing ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Building2 className="w-5 h-5 text-blue-600" />} 
                            {isEditing ? "Editar Hospital" : "Adicionar Hospital"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isEditing ? "Altere as informações abaixo" : "Informe a quantidade de leitos para criá-los automaticamente"}
                        </p>
                    </div>
                    {isEditing && (
                        <button onClick={resetForm} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                            <X className="w-4 h-4" /> Cancelar
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                                Quantidade de Leitos {isEditing ? <span className="font-normal normal-case text-slate-400">(não editável aqui)</span> : <span className="font-normal normal-case text-slate-400">(cria automaticamente)</span>}
                            </label>
                            <input type="number" min="0" max="200" value={bedCount} onChange={e => setBedCount(e.target.value)}
                                placeholder={isEditing ? "—" : "Ex: 10"} className={INPUT} disabled={submitting || isEditing !== null} />
                        </div>
                    </div>

                    {formError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                        </div>
                    )}

                    <button type="submit" disabled={submitting}
                        className={`flex items-center gap-2 ${isEditing ? "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 shadow-amber-200" : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 shadow-blue-200"} text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-all shadow-md`}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {submitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Hospital"}
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
                                <div key={h.id} className={`flex items-start gap-4 bg-white border rounded-2xl p-4 transition-all ${isEditing === h.id ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-100 hover:border-slate-200"}`}>
                                    <div className={`w-10 h-10 ${isEditing === h.id ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"} rounded-xl flex items-center justify-center shrink-0`}>
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{h.name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                            <MapPin className="w-3 h-3 shrink-0" /> {h.address}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-xs">
                                            <span className="text-slate-600 font-medium">
                                                <span className={`${isEditing === h.id ? "text-amber-600" : "text-blue-600"} font-bold`}>{h.occupiedBeds}</span>/{h.totalBeds} ocupados
                                            </span>
                                            {h.totalBeds > 0 && (
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => handleEditClick(h)}
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(h)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
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
// MAIN PAGE  (rota: /admin/hospitais)
// ═══════════════════════════════════════════════════════════════════════════════

export default function HospitalsPage() {
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
                    Cadastre, edite e gerencie as unidades hospitalares da rede
                </p>
            </div>

            <HospitalSection onToast={showToast} />
            <ToastNotification toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}
