'use client';

import { useState } from 'react';
import { Plus, X, Pill } from 'lucide-react';

export interface Antibiotic {
    id: string;
    name: string;
    route: string;
    startDate: string;
    observations: string;
}

interface AntibioticsSelectorProps {
    selectedAntibiotics: Antibiotic[];
    onChange: (antibiotics: Antibiotic[]) => void;
}

const COMMON_ANTIBIOTICS = [
    'Piperacilina/tazobactam', 'Meropenem', 'Vancomicina', 'Ceftriaxona',
    'Ciprofloxacino', 'Metronidazol', 'Amicacina', 'Gentamicina',
    'Oxacilina', 'Cefepime', 'Linezolida', 'Polimixina B',
    'Colistina', 'Ampicilina', 'Sulfametoxazol/trimetoprim',
    'Azitromicina', 'Claritromicina', 'Levofloxacino'
];

const ROUTES = ['EV', 'VO', 'IM', 'SC'];

export default function AntibioticsSelector({
    selectedAntibiotics = [],
    onChange
}: AntibioticsSelectorProps) {
    const [showAddAntibiotic, setShowAddAntibiotic] = useState(false);
    const [customName, setCustomName] = useState('');

    const calculateDaysInUse = (startDate: string): number => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const today = new Date();
        const diffTime = today.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const addAntibiotic = (name: string) => {
        if (!name.trim()) return;

        const newAntibiotic: Antibiotic = {
            id: `antibiotic_${Date.now()}`,
            name: name.trim(),
            route: 'EV',
            startDate: new Date().toISOString().split('T')[0],
            observations: ''
        };

        onChange([...selectedAntibiotics, newAntibiotic]);
        setShowAddAntibiotic(false);
        setCustomName('');
    };

    const updateAntibiotic = (index: number, field: keyof Antibiotic, value: string) => {
        const updated = [...selectedAntibiotics];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeAntibiotic = (index: number) => {
        const updated = selectedAntibiotics.filter((_, i) => i !== index);
        onChange(updated);
    };

    const formatAntibioticsText = (): string => {
        if (selectedAntibiotics.length === 0) return '';

        return selectedAntibiotics
            .map(antibiotic => {
                const days = calculateDaysInUse(antibiotic.startDate);
                let text = `${antibiotic.name} ${antibiotic.route}`;
                if (days > 0) text += ` D${days}`;
                if (antibiotic.observations) text += ` (${antibiotic.observations})`;
                return text;
            })
            .join(', ');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-orange-100 p-1 rounded">
                        <Pill className="w-4 h-4 text-orange-600" />
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Antibióticos em uso</label>
                </div>
                {!showAddAntibiotic && <button
                    type="button"
                    onClick={() => setShowAddAntibiotic(!showAddAntibiotic)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Antibiótico</span>
                </button>}
            </div>

            {showAddAntibiotic && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 animate-fade-in">
                    <div className="text-sm font-medium text-orange-700 mb-3">Selecione ou digite um antibiótico:</div>
                    <div className="mb-3">
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && customName.trim()) addAntibiotic(customName); }}
                            placeholder="Digite o nome do antibiótico..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        />
                        {customName.trim() && (
                            <button type="button" onClick={() => addAntibiotic(customName)} className="mt-2 w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                                Adicionar "{customName}"
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {COMMON_ANTIBIOTICS.map(name => (
                            <button key={name} type="button" onClick={() => addAntibiotic(name)} className="text-left p-2 bg-white border border-gray-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all text-sm">
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!showAddAntibiotic && (
                <div className="text-center py-6 text-gray-500 bg-white border-2 border-gray-200 rounded-lg border-dashed hover:border-orange-300 transition-colors cursor-pointer" onClick={() => setShowAddAntibiotic(true)}>
                    <Pill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm">Nenhum antibiótico selecionado</div>
                </div>
            )}

            {selectedAntibiotics.map((antibiotic, index) => {
                const daysInUse = calculateDaysInUse(antibiotic.startDate);
                return (
                    <div key={antibiotic.id} className="bg-white border-2 border-orange-200 rounded-lg p-4 space-y-3 shadow-sm relative group">
                        <button type="button" onClick={() => removeAntibiotic(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="font-bold text-sm text-orange-800">{antibiotic.name}</div>
                            {daysInUse > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">D{daysInUse}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Via de Uso</label>
                                <select value={antibiotic.route} onChange={(e) => updateAntibiotic(index, 'route', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent">
                                    {ROUTES.map(route => <option key={route} value={route}>{route}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Data de Início</label>
                                <input type="date" value={antibiotic.startDate} onChange={(e) => updateAntibiotic(index, 'startDate', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                                <input type="text" value={antibiotic.observations} onChange={(e) => updateAntibiotic(index, 'observations', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent" placeholder="Posologia, diluição..." />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}