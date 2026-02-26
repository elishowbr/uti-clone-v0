'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, ChevronDown, User, Calendar, Ruler, FileText } from 'lucide-react';

interface PatientEditModalProps {
    patient: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: any) => Promise<void>;
}

export default function PatientEditModal({ patient, isOpen, onClose, onSave }: PatientEditModalProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Estado inicial
    const [formData, setFormData] = useState({
        name: '',
        birth_date: '',
        height: '',
        gender: 'MALE',
        arrival_date: '',
        commentary: '', // Novo campo
    });

    // Efeito para auto-preencher os dados
    useEffect(() => {
        if (isOpen && patient) {
            setFormData({
                name: patient.name || '',
                // Formata datas ISO para YYYY-MM-DD
                birth_date: patient.birth_date ? new Date(patient.birth_date).toISOString().split('T')[0] : '',
                height: patient.height || '',
                gender: patient.gender || 'MALE',
                arrival_date: patient.arrival_date ? new Date(patient.arrival_date).toISOString().split('T')[0] : '',
                commentary: patient.commentary || '',
            });
        }
    }, [isOpen, patient]);

    // Atualizado para aceitar HTMLTextAreaElement
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar dados.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                        Editar Dados Clínicos
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Corpo do Formulário */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Nome do Paciente (Full Width) */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <User className="w-3 h-3" /> Nome do Paciente
                        </label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            placeholder="Nome completo"
                        />
                    </div>
                    
                    {/* Data de Nascimento */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data de Nascimento</label>
                        <input 
                            type="date" 
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Sexo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sexo Biológico</label>
                        <div className="relative">
                            <select 
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                            >
                                <option value="MALE">Masculino</option>
                                <option value="FEMALE">Feminino</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Altura */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <Ruler className="w-3 h-3" /> Altura (cm)
                        </label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                name="height"
                                placeholder="ex: 175"
                                value={formData.height}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium group-focus-within:text-blue-400">cm</span>
                        </div>
                    </div>

                    {/* Admissão Hospitalar */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Admissão Hospitalar
                        </label>
                        <input 
                            type="date" 
                            name="arrival_date"
                            value={formData.arrival_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Diagnóstico (Full Width) - NOVO */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Diagnóstico / Resumo
                        </label>
                        <textarea 
                            name="commentary"
                            value={formData.commentary}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                            placeholder="Insira o diagnóstico principal ou resumo clínico..."
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}