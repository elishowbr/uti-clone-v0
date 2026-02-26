import React, { useState } from 'react';
import { LucideIcon, ChevronDown, ChevronRight } from 'lucide-react';

// Definindo as cores permitidas para reutilização
export type ColorTheme = 'purple' | 'blue' | 'red' | 'emerald' | 'amber' | 'orange' | 'indigo';

// Mapa de estilos baseados no tema escolhido
const colorMap = {
    purple: {
        iconBgOpen: 'bg-purple-100',
        iconTextOpen: 'text-purple-600',
        chevronHover: 'group-hover/header:text-purple-600',
        indicatorPing: 'bg-purple-400',
        indicatorDot: 'bg-purple-500',
        inputFocusBorder: 'focus:border-purple-500',
        inputFocusRing: 'focus:ring-purple-500/10',
        tagHover: 'hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50',
    },
    blue: {
        iconBgOpen: 'bg-blue-100',
        iconTextOpen: 'text-blue-600',
        chevronHover: 'group-hover/header:text-blue-600',
        indicatorPing: 'bg-blue-400',
        indicatorDot: 'bg-blue-500',
        inputFocusBorder: 'focus:border-blue-500',
        inputFocusRing: 'focus:ring-blue-500/10',
        tagHover: 'hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50',
    },
    red: {
        iconBgOpen: 'bg-red-100',
        iconTextOpen: 'text-red-600',
        chevronHover: 'group-hover/header:text-red-600',
        indicatorPing: 'bg-red-400',
        indicatorDot: 'bg-red-500',
        inputFocusBorder: 'focus:border-red-500',
        inputFocusRing: 'focus:ring-red-500/10',
        tagHover: 'hover:border-red-300 hover:text-red-600 hover:bg-red-50',
    },
    emerald: {
        iconBgOpen: 'bg-emerald-100',
        iconTextOpen: 'text-emerald-600',
        chevronHover: 'group-hover/header:text-emerald-600',
        indicatorPing: 'bg-emerald-400',
        indicatorDot: 'bg-emerald-500',
        inputFocusBorder: 'focus:border-emerald-500',
        inputFocusRing: 'focus:ring-emerald-500/10',
        tagHover: 'hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50',
    },
    amber: {
        iconBgOpen: 'bg-amber-100',
        iconTextOpen: 'text-amber-600',
        chevronHover: 'group-hover/header:text-amber-600',
        indicatorPing: 'bg-amber-400',
        indicatorDot: 'bg-amber-500',
        inputFocusBorder: 'focus:border-amber-500',
        inputFocusRing: 'focus:ring-amber-500/10',
        tagHover: 'hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50',
    },
    orange: { 
        iconBgOpen: 'bg-orange-100',
        iconTextOpen: 'text-orange-600',
        chevronHover: 'group-hover/header:text-orange-600',
        indicatorPing: 'bg-orange-400',
        indicatorDot: 'bg-orange-500',
        inputFocusBorder: 'focus:border-orange-500',
        inputFocusRing: 'focus:ring-orange-500/10',
        tagHover: 'hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50',
    },
    indigo: { 
        iconBgOpen: 'bg-indigo-100',
        iconTextOpen: 'text-indigo-600',
        chevronHover: 'group-hover/header:text-indigo-600',
        indicatorPing: 'bg-indigo-400',
        indicatorDot: 'bg-indigo-500',
        inputFocusBorder: 'focus:border-indigo-500',
        inputFocusRing: 'focus:ring-indigo-500/10',
        tagHover: 'hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50',
    },
};


interface SmartTextAreaProps {
    label: string;
    value: string | undefined | null;
    onChange: (value: string) => void;
    placeholder?: string;
    tags?: string[];
    icon?: LucideIcon;
    helperText?: string;
    rows?: number;
    startHidden?: boolean;
    colorTheme?: ColorTheme; // Nova prop de tema
}

export function SmartTextArea({
    label,
    value,
    onChange,
    placeholder,
    tags = [],
    icon: Icon,
    helperText,
    rows = 2,
    startHidden = false,
    colorTheme = 'purple' // Padrão roxo
}: SmartTextAreaProps) {

    const [isOpen, setIsOpen] = useState(!startHidden);
    const hasValue = value && String(value).trim().length > 0;

    // Seleciona as classes do tema atual
    const theme = colorMap[colorTheme];

    const addTag = (tagText: string) => {
        const currentVal = value ? String(value).trim() : '';
        if (currentVal.includes(tagText)) return;

        let separator = '';
        if (currentVal.length > 0) {
            separator = (!currentVal.endsWith(',') && !currentVal.endsWith('.')) ? ', ' : ' ';
        }

        onChange(`${currentVal}${separator}${tagText}`);
    };

    return (
        <div className="flex flex-col gap-2 group border border-transparent rounded-lg transition-colors">
            {/* --- CABEÇALHO --- */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left group/header focus:outline-none"
            >
                <div className="flex items-center gap-2">
                    {/* Ícone de Toggle (Seta) com cor dinâmica no hover */}
                    <div className={`text-slate-400 ${theme.chevronHover} transition-colors`}>
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>

                    {/* Ícone Principal com cor dinâmica quando aberto */}
                    {Icon && (
                        <div className={`p-1 rounded-md transition-colors ${isOpen ? `${theme.iconBgOpen} ${theme.iconTextOpen}` : 'bg-slate-100 text-slate-500'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}

                    {/* Label */}
                    <label className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                        {label}
                        {helperText && <span className="text-xs text-slate-400 font-normal hidden sm:inline">({helperText})</span>}
                    </label>

                    {/* Indicador de conteúdo com cor dinâmica */}
                    {!isOpen && hasValue && (
                        <span className="flex h-2 w-2 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.indicatorPing} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.indicatorDot}`}></span>
                        </span>
                    )}
                </div>
            </button>

            {/* --- ÁREA DE CONTEÚDO --- */}
            {isOpen && (
                <div className="pl-6 animate-in slide-in-from-top-1 duration-200">
                    <div className="relative">
                        <textarea
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            rows={rows}
                            // Classes dinâmicas de foco (border e ring)
                            className={`w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none ${theme.inputFocusBorder} focus:ring-4 ${theme.inputFocusRing} transition-all text-slate-700 placeholder:text-slate-400 resize-none text-sm leading-relaxed`}
                        />
                    </div>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => addTag(tag)}
                                    // Classes dinâmicas de hover nas tags
                                    className={`px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-md ${theme.tagHover} transition-all active:scale-95 shadow-sm`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}