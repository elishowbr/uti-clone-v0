'use client';

import { Plus, X, TestTube } from 'lucide-react';

export interface Culture {
    id: string;
    date: string;
    material: string;
    sensitivity: string;
}

interface CulturesSelectorProps {
    selectedCultures: Culture[];
    onChange: (cultures: Culture[]) => void;
}

const COMMON_MATERIALS = [
    'Hemocultura', 'Urocultura', 'Secreção traqueal', 'Secreção de ferida',
    'Líquor', 'Ponta de cateter', 'Lavado broncoalveolar', 'Líquido pleural',
    'Líquido ascítico', 'Swab retal', 'Swab nasal', 'Escarro'
];

const COMMON_SENSITIVITIES = [
    'Negativa', 'Pendente', 'Sensível a todos', 'Multirresistente',
    'ESBL', 'KPC', 'Sensível a Vancomicina', 'Sensível a Meropenem',
    'Sensível a Piperacilina/tazobactam', 'Sensível a Polimixina B'
];

export default function CulturesSelector({
    selectedCultures = [],
    onChange
}: CulturesSelectorProps) {

    const addCulture = () => {
        const newCulture: Culture = {
            id: `culture_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            material: '',
            sensitivity: ''
        };
        onChange([...selectedCultures, newCulture]);
    };

    const updateCulture = (index: number, field: keyof Culture, value: string) => {
        const updated = [...selectedCultures];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeCulture = (index: number) => {
        const updated = selectedCultures.filter((_, i) => i !== index);
        onChange(updated);
    };

    const formatCulturesText = (): string => {
        if (selectedCultures.length === 0) return '';
        return selectedCultures
            .filter(culture => culture.material)
            .map(culture => {
                const date = new Date(culture.date).toLocaleDateString('pt-BR');
                let text = `${culture.material}`;
                if (culture.sensitivity) text += ` - ${culture.sensitivity}`;
                text += ` (${date})`;
                return text;
            })
            .join(', ');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-orange-100 p-1 rounded">
                        <TestTube className="w-4 h-4 text-orange-600" />
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Culturas</label>
                </div>
                {selectedCultures && (<button type="button" onClick={addCulture} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> <span>Adicionar Cultura</span>
                </button>)}
            </div>

            {selectedCultures.length === 0 && (
                <div className="text-center py-6 text-gray-500 bg-white border-2 border-gray-200 rounded-lg border-dashed">
                    <TestTube className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm">Nenhuma cultura registrada</div>
                </div>
            )}

            {selectedCultures.map((culture, index) => (
                <div key={culture.id} className="bg-white border-2 border-purple-200 rounded-lg p-4 space-y-3 shadow-sm relative group">
                    <button type="button" onClick={() => removeCulture(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="font-bold text-sm text-purple-800 mb-2">Cultura {index + 1}</div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
                            <input type="date" value={culture.date} onChange={(e) => updateCulture(index, 'date', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                            <input type="text" value={culture.material} onChange={(e) => updateCulture(index, 'material', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent mb-1" placeholder="Digite ou selecione..." />
                            <div className="flex flex-wrap gap-1">
                                {COMMON_MATERIALS.map(mat => (
                                    <button key={mat} type="button" onClick={() => updateCulture(index, 'material', mat)} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{mat}</button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Perfil de Sensibilidade</label>
                            <textarea value={culture.sensitivity} onChange={(e) => updateCulture(index, 'sensitivity', e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none" rows={2} placeholder="Digite ou selecione..." />
                            <div className="flex flex-wrap gap-1 mt-1">
                                {COMMON_SENSITIVITIES.map(sens => (
                                    <button key={sens} type="button" onClick={() => updateCulture(index, 'sensitivity', sens)} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">{sens}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}