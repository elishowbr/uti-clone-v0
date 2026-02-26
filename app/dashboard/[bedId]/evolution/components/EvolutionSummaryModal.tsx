'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileText, Save } from 'lucide-react';

interface EvolutionSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    generatedText: string;
    onSave?: () => void;  
    isSaving?: boolean;   
}

export default function EvolutionSummaryModal({ 
    isOpen, 
    onClose, 
    generatedText, 
    onSave, 
    isSaving = false 
}: EvolutionSummaryModalProps) {
    const [text, setText] = useState(generatedText);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setText(generatedText);
    }, [generatedText]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-3xl h-[80vh] sm:h-[70vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 ring-1 ring-slate-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight">Resumo da Evolução</h2>
                            <p className="text-xs text-slate-500 hidden sm:block">Revise o texto antes de salvar</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-200 active:scale-95">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden relative group bg-white">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-full p-6 text-base sm:text-sm font-mono text-slate-700 bg-white resize-none focus:outline-none leading-relaxed overflow-y-auto"
                        spellCheck={false}
                    />
                </div>

                {/* Footer com Botão SALVAR integrado */}
                <div className="px-6 py-4 pb-6 sm:pb-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 z-10">
                    
                    {/* Botão Copiar (Secundário agora) */}
                    <button
                        onClick={handleCopy}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all border ${
                            copied 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Texto</>}
                    </button>

                    {/* Botão SALVAR NO BANCO (Principal) */}
                    {onSave && (
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Confirmar e Salvar</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}