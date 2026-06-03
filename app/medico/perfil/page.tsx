'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save, X } from 'lucide-react';
import { getDoctorProfileForPanel, updateDoctorProfile, type DoctorProfile } from '../../actions/doctorData';

export default function MedicoProfilePage() {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [crm, setCrm] = useState('');
    const [position, setPosition] = useState('');
    
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        getDoctorProfileForPanel().then(data => {
            setProfile(data);
            if (data) {
                setName(data.name);
                setEmail(data.email);
                setCrm(data.crm !== '-' ? data.crm : '');
                setPosition(data.position);
            }
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setToast(null);

        const res = await updateDoctorProfile({ name, email, crm: crm || '-', position });
        
        setSaving(false);
        if (res.success) {
            setToast({ type: 'success', msg: 'Dados atualizados com sucesso! Você pode precisar recarregar a página para ver a mudança no painel lateral.' });
            setTimeout(() => setToast(null), 4000);
        } else {
            setToast({ type: 'error', msg: res.error ?? 'Erro ao salvar.' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Carregando dados...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Meus Dados
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Gerencie seu perfil clínico, informações de contato e credenciais.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">Perfil Profissional</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Mantenha seus dados de contato e registro atualizados.</p>
                </div>

                {toast && (
                    <div className={`mx-6 mt-5 p-3.5 rounded-xl flex items-center gap-2 text-sm font-medium border ${
                        toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                        {toast.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                E-mail de Acesso
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Registro (CRM/COREN)
                            </label>
                            <input
                                type="text"
                                value={crm}
                                onChange={e => setCrm(e.target.value)}
                                placeholder="Ex: CRM-SP 123456"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Especialidade / Cargo
                            </label>
                            <input
                                type="text"
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                                placeholder="Ex: Intensivista"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-200 text-sm"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
