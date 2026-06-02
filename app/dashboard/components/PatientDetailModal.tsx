import React, { useState, useEffect } from 'react';
import { X, Activity, Stethoscope, ClipboardList, Loader2, Plus, Trash2, AlertTriangle, Syringe } from 'lucide-react';
import { updatePatientCommentary, updateClinicalMedications } from '../../actions/patientClinical';
import { dischargePatient } from '../../actions/bedManagement';

export default function PatientDetailModal({
    bed, 
    userRole,
    userId,
    onClose,
    onRefresh
}: {
    bed: any;
    userRole: string | null;
    userId: number | null;
    onClose: () => void;
    onRefresh: () => void;
}) {
    if (!bed || bed.status !== 'OCCUPIED' || !bed.current_patient) return null;

    const patient = bed.current_patient;
    const evo = bed.clinical_evolutions?.[0] || null;

    // States - General
    const [isSaving, setIsSaving] = useState(false);
    const [isDischarging, setIsDischarging] = useState(false);

    // States - History/Diagnóstico
    const [isEditingHistory, setIsEditingHistory] = useState(false);
    const [historyText, setHistoryText] = useState('');
    const [nurseNotesList, setNurseNotesList] = useState<string[]>([]);
    const [nurseNote, setNurseNote] = useState('');

    // States - Medicações
    const [dvaList, setDvaList] = useState<any[]>(evo?.hemodynamic_drugs || []);
    const [atbList, setAtbList] = useState<any[]>(evo?.hemato_antibiotics || []);
    const [isEditingMeds, setIsEditingMeds] = useState(false);

    // Temp form states for Meds
    const [newDvaName, setNewDvaName] = useState('');
    const [newDvaFlow, setNewDvaFlow] = useState('');
    const [newAtbName, setNewAtbName] = useState('');
    const [newAtbDays, setNewAtbDays] = useState('');

    // Timer trigger to update the admission time live
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000); // 1 min
        return () => clearInterval(interval);
    }, []);

    // Update states if bed changes
    useEffect(() => {
        const fullText = bed.current_patient?.commentary || '';
        const parts = fullText.split(/(?=\[Enfermagem - )/g);
        setHistoryText(parts[0].trim());
        setNurseNotesList(parts.slice(1).map((p: string) => p.trim()).filter(Boolean));

        setDvaList(bed.clinical_evolutions?.[0]?.hemodynamic_drugs || []);
        setAtbList(bed.clinical_evolutions?.[0]?.hemato_antibiotics || []);
    }, [bed]);

    // Calculates
    const admissionDate = new Date(patient.admission_date);
    const diffMs = Math.max(0, now.getTime() - admissionDate.getTime()); // Prevent negative values
    const daysInUTI = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursInUTI = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesInUTI = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const isDoctor = userRole === 'DOCTOR';
    const isNurse = userRole === 'NURSE';

    // Handlers
    const handleSaveHistory = async () => {
        if (!historyText.trim()) return;
        setIsSaving(true);
        const finalCommentary = historyText + (nurseNotesList.length > 0 ? '\n\n' + nurseNotesList.join('\n\n') : '');
        const res = await updatePatientCommentary(patient.id, finalCommentary, false);
        setIsSaving(false);
        if (res.success) {
            setIsEditingHistory(false);
            onRefresh();
        } else {
            alert(res.error);
        }
    };

    const handleSaveNurseNote = async () => {
        if (!nurseNote.trim()) return;
        setIsSaving(true);
        const res = await updatePatientCommentary(patient.id, nurseNote, true);
        setIsSaving(false);
        if (res.success) {
            setNurseNote('');
            onRefresh();
        } else {
            alert(res.error);
        }
    };

    const handleAddDva = () => {
        if (!newDvaName.trim()) return;
        setDvaList([...dvaList, { drug: { name: newDvaName, doseUnit: 'ml/h' }, flow: newDvaFlow || '10' }]);
        setNewDvaName('');
        setNewDvaFlow('');
    };

    const handleAddAtb = () => {
        if (!newAtbName.trim()) return;
        setAtbList([...atbList, { antimicrobial: newAtbName, daysCount: parseInt(newAtbDays) || 1 }]);
        setNewAtbName('');
        setNewAtbDays('');
    };

    const handleSaveMedications = async () => {
        let currentDva = [...dvaList];
        let currentAtb = [...atbList];

        // Auto-add pending inputs if user forgot to click '+'
        if (newDvaName.trim()) {
            currentDva.push({ drug: { name: newDvaName, doseUnit: 'ml/h' }, flow: newDvaFlow || '10' });
            setNewDvaName('');
            setNewDvaFlow('');
            setDvaList(currentDva);
        }
        if (newAtbName.trim()) {
            currentAtb.push({ antimicrobial: newAtbName, daysCount: parseInt(newAtbDays) || 1 });
            setNewAtbName('');
            setNewAtbDays('');
            setAtbList(currentAtb);
        }

        setIsSaving(true);
        const res = await updateClinicalMedications(
            evo?.id || null,
            patient.id,
            userId,
            currentDva,
            currentAtb
        );
        setIsSaving(false);
        if (res.success) {
            setIsEditingMeds(false);
            onRefresh();
        } else {
            alert(res.error);
        }
    };

    const handleDischarge = async () => {
        if (!confirm(`Confirmar alta de ${patient.name}?`)) return;
        setIsDischarging(true);
        const res = await dischargePatient(bed.id);
        setIsDischarging(false);
        if (res.success) {
            onClose();
            onRefresh();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-opacity" onClick={onClose}>
            <div className="bg-slate-50 flex flex-col sm:rounded-3xl shadow-2xl w-full sm:max-w-3xl max-h-[95vh] h-full sm:h-auto overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                
                {/* Header Fixo */}
                <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{patient.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> {bed.label || `Leito ${bed.bed_number}`}
                            </span>
                            {patient.gender && (
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{patient.gender === 'M' ? 'Masc' : 'Fem'}</span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-2 bg-slate-50 hover:bg-slate-200 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Corpo Rolável */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Tempo de Internação */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1 opacity-80">Tempo de Internação</p>
                            <p className="text-xl font-black text-blue-900 tracking-tight">
                                {daysInUTI > 0 && <>{daysInUTI} <span className="text-sm font-semibold text-blue-700/80 mr-1">dias,</span></>}
                                {hoursInUTI} <span className="text-sm font-semibold text-blue-700/80 mr-1">horas</span> e 
                                <span className="ml-1">{minutesInUTI}</span> <span className="text-sm font-semibold text-blue-700/80">min</span>
                            </p>
                        </div>
                        <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm border border-blue-50">
                            <Stethoscope className="w-7 h-7" />
                        </div>
                    </div>

                    {/* Histórico/Sintomas (Diagnóstico) */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-slate-500" /> Histórico e Diagnóstico Médico
                            </h4>
                            {isDoctor && !isEditingHistory && (
                                <button onClick={() => setIsEditingHistory(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                    Editar Diagnóstico
                                </button>
                            )}
                        </div>
                        
                        {isEditingHistory ? (
                            <div className="space-y-3">
                                <textarea 
                                    className="w-full p-4 bg-slate-50 border border-blue-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 min-h-[120px]"
                                    value={historyText}
                                    onChange={e => setHistoryText(e.target.value)}
                                    placeholder="Descreva o quadro clínico..."
                                    disabled={isSaving}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditingHistory(false)} disabled={isSaving} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-2">Cancelar</button>
                                    <button onClick={handleSaveHistory} disabled={isSaving} className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                        {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        Salvar Diagnóstico
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {historyText || <span className="text-slate-400 italic">Nenhum diagnóstico registrado.</span>}
                                </p>
                            </div>
                        )}

                        {/* Evoluções Adicionais (Read Only) */}
                        {(evo?.respiratory_observation || evo?.neurologic_observation) && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {evo?.respiratory_observation && (
                                    <div className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-100/50">
                                        <p className="text-[10px] font-bold text-sky-600 uppercase mb-1">Obs. Respiratória</p>
                                        <p className="text-xs text-slate-700">{evo.respiratory_observation}</p>
                                    </div>
                                )}
                                {evo?.neurologic_observation && (
                                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/50">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Obs. Neurológica</p>
                                        <p className="text-xs text-slate-700">{evo.neurologic_observation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Enfermagem: Adicionar Anotação */}
                    {isNurse && (
                        <div className="bg-indigo-50/30 border border-indigo-100 p-5 rounded-2xl">
                            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                <Syringe className="w-4 h-4 text-indigo-500" /> Nova Anotação de Enfermagem
                            </h4>
                            <textarea 
                                className="w-full p-3.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-700 min-h-[80px]"
                                value={nurseNote}
                                onChange={e => setNurseNote(e.target.value)}
                                placeholder="Registre sinais vitais, intercorrências ou procedimentos do plantão..."
                                disabled={isSaving}
                            />
                            <div className="flex justify-end mt-3">
                                <button onClick={handleSaveNurseNote} disabled={!nurseNote.trim() || isSaving} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
                                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Anexar ao Histórico
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Linha do Tempo: Relatórios da Equipe Assistencial */}
                    {nurseNotesList.length > 0 && (
                        <div className="bg-indigo-50/30 border border-indigo-100 p-5 rounded-2xl">
                            <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" /> Relatórios da Equipe Assistencial
                            </h4>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {nurseNotesList.map((note, idx) => {
                                    const match = note.match(/\[Enfermagem - (.*?)\]:\s*([\s\S]*)/);
                                    const date = match ? match[1] : 'Data Desconhecida';
                                    const text = match ? match[2] : note;
                                    
                                    return (
                                        <div key={idx} className="bg-white border border-indigo-100 p-4 rounded-xl shadow-sm relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400 rounded-l-xl"></div>
                                            <div className="text-xs font-bold text-indigo-600 mb-1">{date}</div>
                                            <div className="text-sm text-slate-700 whitespace-pre-wrap">{text}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Medicação Atual */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-500" /> Prescrição Médica Atual
                            </h4>
                            {isDoctor && !isEditingMeds && (
                                <button onClick={() => setIsEditingMeds(true)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                                    Ajustar Prescrição
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* DVA */}
                            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex justify-between items-center">
                                    Drogas Vasoativas
                                    <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">{dvaList.length}</span>
                                </p>
                                
                                {isEditingMeds && isDoctor ? (
                                    <div className="mb-4 flex gap-2 items-end bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Droga</label>
                                            <input className="w-full text-xs p-1.5 border-b border-slate-200 outline-none focus:border-blue-500" placeholder="Ex: Noradrenalina" value={newDvaName} onChange={e=>setNewDvaName(e.target.value)} />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-[10px] text-slate-400 font-semibold mb-1 block">ml/h</label>
                                            <input className="w-full text-xs p-1.5 border-b border-slate-200 outline-none focus:border-blue-500" placeholder="0.0" value={newDvaFlow} onChange={e=>setNewDvaFlow(e.target.value)} />
                                        </div>
                                        <button onClick={handleAddDva} disabled={!newDvaName} className="p-1.5 px-3 bg-blue-100 text-blue-700 font-bold text-[11px] rounded-md hover:bg-blue-200 disabled:opacity-50 uppercase flex items-center gap-1 transition-colors">
                                            <Plus className="w-3.5 h-3.5" /> Adicionar
                                        </button>
                                    </div>
                                ) : null}

                                {dvaList.length > 0 ? (
                                    <ul className="space-y-2">
                                        {dvaList.map((d: any, idx: number) => (
                                            <li key={idx} className="flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-700 text-xs">{d.drug?.name || 'Desconhecido'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500 font-medium text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{d.flow} {d.drug?.doseUnit || 'ml/h'}</span>
                                                    {isEditingMeds && isDoctor && (
                                                        <button onClick={() => setDvaList(dvaList.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center py-2">Sem registro de DVA.</p>
                                )}
                            </div>
                            
                            {/* ATB */}
                            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex justify-between items-center">
                                    Antibióticos
                                    <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">{atbList.length}</span>
                                </p>
                                
                                {isEditingMeds && isDoctor ? (
                                    <div className="mb-4 flex gap-2 items-end bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Antimicrobiano</label>
                                            <input className="w-full text-xs p-1.5 border-b border-slate-200 outline-none focus:border-blue-500" placeholder="Ex: Meropenem" value={newAtbName} onChange={e=>setNewAtbName(e.target.value)} />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Dias</label>
                                            <input type="number" className="w-full text-xs p-1.5 border-b border-slate-200 outline-none focus:border-blue-500" placeholder="1" value={newAtbDays} onChange={e=>setNewAtbDays(e.target.value)} />
                                        </div>
                                        <button onClick={handleAddAtb} disabled={!newAtbName} className="p-1.5 px-3 bg-blue-100 text-blue-700 font-bold text-[11px] rounded-md hover:bg-blue-200 disabled:opacity-50 uppercase flex items-center gap-1 transition-colors">
                                            <Plus className="w-3.5 h-3.5" /> Adicionar
                                        </button>
                                    </div>
                                ) : null}

                                {atbList.length > 0 ? (
                                    <ul className="space-y-2">
                                        {atbList.map((a: any, idx: number) => (
                                            <li key={idx} className="flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-700 text-xs">{a.antimicrobial}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500 font-medium text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">D{a.daysCount || 1}</span>
                                                    {isEditingMeds && isDoctor && (
                                                        <button onClick={() => setAtbList(atbList.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center py-2">Sem registro de ATB.</p>
                                )}
                            </div>
                        </div>
                        
                        {isEditingMeds && (
                            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button onClick={() => { setIsEditingMeds(false); setDvaList(evo?.hemodynamic_drugs||[]); setAtbList(evo?.hemato_antibiotics||[]); }} disabled={isSaving} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-2">Cancelar</button>
                                <button onClick={handleSaveMedications} disabled={isSaving} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm">
                                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Salvar Prescrição
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer (Ações Globais) */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
                    {isDoctor ? (
                        <button 
                            onClick={handleDischarge} 
                            disabled={isDischarging || isSaving}
                            className="w-full sm:w-auto text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-red-50 disabled:hover:text-red-600"
                        >
                            {isDischarging ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                            Dar Alta Hospitalar
                        </button>
                    ) : (
                        <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-start">
                            <Activity className="w-3.5 h-3.5" /> Acesso Assistencial (Enfermagem)
                        </div>
                    )}
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white px-8 py-2.5 rounded-xl transition-all shadow-md shadow-slate-200"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
