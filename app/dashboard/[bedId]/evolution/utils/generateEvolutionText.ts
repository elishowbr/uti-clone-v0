// app/utils/generateEvolutionText.ts

import { RespiratoryData } from '../components/forms/RespiratoryForm';
import { NeurologicalData } from '../components/forms/NeurologicalForm';
import { HemodynamicsData } from '../components/forms/HemodynamicsForm';
import { NutritionData } from '../components/forms/NutritionForm';
import { RenalData } from '../components/forms/RenalForm';
import { HematoinfectiousData } from '../components/forms/HematoinfectiousForm';
import { ProphylaxisData } from '../components/forms/ProphylaxisForm';

// Interface completa dos dados (reúne todas as interfaces menores)
export interface FullFormData {
    general: { sex: string; height: string; weight: string; airwayType: string };
    respiratory: RespiratoryData;
    neurological: NeurologicalData;
    hemodynamics: HemodynamicsData;
    nutrition: NutritionData;
    renal: RenalData;
    hemato: HematoinfectiousData;
    prophylaxis: ProphylaxisData;
}

export const generateEvolutionText = (data: FullFormData): string => {
    const sections: string[] = [];
    const now = new Date();

    // --- 1. CABEÇALHO ---
    const header = [
        `EVOLUÇÃO MÉDICA - UTI`,
        `Data/Hora: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        `Paciente: ${data.general.weight ? `${data.general.weight}kg` : 'Peso não informado'} | Altura: ${data.general.height ? `${data.general.height}cm` : 'Não informada'}`
    ];
    sections.push(header.join('\n'));

    // --- 2. NEUROLÓGICO ---
    const neuroLines: string[] = [];

    // Sedação
    const sedatives = (data.neurological.sedationDrugs || [])
        .filter(d => d.flow > 0)
        .map(d => `${d.drug.name} ${d.flow}ml/h (${d.dose} ${d.drug.doseUnit})`)
        .join(', ');

    if (sedatives) neuroLines.push(`- Sedação: ${sedatives}`);
    else neuroLines.push(`- Sem sedação contínua`);

    // Escalas e Monitorização
    if (data.neurological.neurologicalScales) neuroLines.push(`- ${data.neurological.neurologicalScales}`);
    if (data.neurological.pupils) neuroLines.push(`- Pupilas: ${data.neurological.pupils}`);
    if (data.neurological.bis) neuroLines.push(`- BIS: ${data.neurological.bis}`);
    if (data.neurological.pic) neuroLines.push(`- PIC: ${data.neurological.pic}`);

    // Drogas Enterais Neuro
    if (data.neurological.enteralDrugs) neuroLines.push(`- Neuro Enteral: ${data.neurological.enteralDrugs}`);

    // Observações
    if (data.neurological.subjectiveObservations) neuroLines.push(`- Obs: ${data.neurological.subjectiveObservations}`);

    sections.push(`1. NEUROLÓGICO:\n${neuroLines.join('\n')}`);

    // --- 3. HEMODINÂMICO ---
    const hemoLines: string[] = [];

    // Drogas Vasoativas
    const vasoactives = (data.hemodynamics.vasoactiveDrugs || [])
        .filter(d => d.flow > 0)
        .map(d => `${d.drug.name} ${d.flow}ml/h (${d.dose} ${d.drug.doseUnit})`)
        .join(', ');

    if (vasoactives) hemoLines.push(`- DVA: ${vasoactives}`);
    else hemoLines.push(`- Sem drogas vasoativas`);

    // Sinais Vitais
    const vitalSigns = [];
    if (data.hemodynamics.pam) vitalSigns.push(`PAM: ${data.hemodynamics.pam}mmHg`);
    if (data.hemodynamics.fc) vitalSigns.push(`FC: ${data.hemodynamics.fc}bpm`);
    if (data.hemodynamics.rhythm) vitalSigns.push(`Ritmo: ${data.hemodynamics.rhythm}`);
    if (vitalSigns.length) hemoLines.push(`- Sinais Vitais: ${vitalSigns.join(' | ')}`);

    // Perfusão / Gasometria
    const perfusion = [];
    if (data.hemodynamics.tec) perfusion.push(`TEC: ${data.hemodynamics.tec}`);
    if (data.hemodynamics.lactate) perfusion.push(`Lactato: ${data.hemodynamics.lactate}`);
    if (data.hemodynamics.svco2) perfusion.push(`SvcO2: ${data.hemodynamics.svco2}%`);
    if (data.hemodynamics.gapco2) perfusion.push(`GapCO2: ${data.hemodynamics.gapco2}`);
    if (perfusion.length) hemoLines.push(`- Perfusão: ${perfusion.join(' | ')}`);

    if (data.hemodynamics.observations) hemoLines.push(`- Obs: ${data.hemodynamics.observations}`);

    sections.push(`2. HEMODINÂMICO:\n${hemoLines.join('\n')}`);

    // --- 4. RESPIRATÓRIO ---
    const respLines: string[] = [];
    const airway = data.respiratory.airwayType === 'tot' ? 'IOT' : data.respiratory.airwayType === 'tqt' ? 'TQT' : 'Ar ambiente/VNI';

    // Suportes (Ventilação Mecânica ou O2)
    const supports = (data.respiratory.supports || []).map(s => {
        let text = s.support.name;

        // Se for parâmetro de VM
        if (s.support.parameterType === 'vm_params' && s.vmParameters) {
            const p = s.vmParameters;
            const params = [];
            if (p.fio2) params.push(`FiO2 ${p.fio2}%`);
            if (p.peep) params.push(`PEEP ${p.peep}`);
            if (p.ps) params.push(`PS ${p.ps}`);
            if (p.pc) params.push(`PC ${p.pc}`);
            if (p.vc) params.push(`VC ${p.vc}`);
            if (p.fr_real) params.push(`FR ${p.fr_real}`);
            if (params.length) text += ` (${params.join(', ')})`;
        }
        // Se for valor simples (ex: Cateter nasal 2 L/min)
        else if (s.value) {
            text += ` ${s.value}${s.support.unit ? ' ' + s.support.unit : ''}`;
        }
        return text;
    }).join(' + ');

    respLines.push(`- Via Aérea: ${airway}`);
    respLines.push(`- Suporte: ${supports || 'Ar ambiente'}`);

    // Gasometria Arterial
    const gaso = [];
    if (data.respiratory.spo2) gaso.push(`SpO2: ${data.respiratory.spo2}%`);
    if (data.respiratory.sao2) gaso.push(`SaO2: ${data.respiratory.sao2}%`);
    if (gaso.length) respLines.push(`- Oxigenação: ${gaso.join(' | ')}`);

    if (data.respiratory.chestXray) respLines.push(`- RX Tórax: ${data.respiratory.chestXray}`);
    if (data.respiratory.observations) respLines.push(`- Obs: ${data.respiratory.observations}`);

    sections.push(`3. RESPIRATÓRIO:\n${respLines.join('\n')}`);

    // --- 5. RENAL/METABÓLICO ---
    const renalLines: string[] = [];

    if (data.renal.diuresis) renalLines.push(`- Diurese (24h): ${data.renal.diuresis}ml`);
    if (data.renal.balance) renalLines.push(`- BH (24h): ${data.renal.balance}ml`);
    if (data.renal.dialysis) renalLines.push(`- TRS: ${data.renal.dialysis}`);

    const metabolic = [];
    if (data.renal.glycemia) metabolic.push(`HGT: ${data.renal.glycemia}`);
    if (data.renal.insulin) metabolic.push(`Insulina: ${data.renal.insulin}`);
    if (metabolic.length) renalLines.push(`- Metabólico: ${metabolic.join(' | ')}`);

    if (data.renal.observations) renalLines.push(`- Obs: ${data.renal.observations}`);

    sections.push(`4. RENAL/METABÓLICO:\n${renalLines.join('\n')}`);

    // --- 6. HEMATOINFECCIOSO ---
    const hematoLines: string[] = [];

    // Antibióticos com cálculo de dias
    const atb = (data.hemato.antibiotics || []).map(a => {
        if (!a.startDate) return a.name;
        const diffTime = Math.abs(now.getTime() - new Date(a.startDate).getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${a.name} (D${days})`;
    }).join(', ');

    hematoLines.push(`- ATB em uso: ${atb || 'Nenhum'}`);

    // Culturas
    const cultures = (data.hemato.cultures || [])
        .filter(c => c.material)
        .map(c => `${c.material} (${c || 'pendente'}${c.sensitivity ? ` - ${c.sensitivity}` : ''})`)
        .join('; ');

    if (cultures) hematoLines.push(`- Culturas: ${cultures}`);

    // Marcadores
    if (data.hemato.temperature || data.hemato.biomarkers) {
        hematoLines.push(`- Evolução: ${data.hemato.temperature || 'Afebril'} | ${data.hemato.biomarkers || ''}`);
    }

    if (data.hemato.observations) hematoLines.push(`- Obs: ${data.hemato.observations}`);

    sections.push(`5. HEMATOINFECCIOSO:\n${hematoLines.join('\n')}`);

    // --- 7. NUTRICIONAL ---
    const nutriLines: string[] = [];

    const diets = (data.nutrition.supports || []).map(s => s.support.name).join(' + ');
    nutriLines.push(`- Dieta: ${diets || 'Zero/Suspensa'}`);

    const tgi = [];
    if (data.nutrition.gastricResidue) tgi.push(`VRG: ${data.nutrition.gastricResidue}`);
    if (data.nutrition.abdomen) tgi.push(`Abdome: ${data.nutrition.abdomen}`);
    if (data.nutrition.evacuationAspect) tgi.push(`Evacuações: ${data.nutrition.evacuationAspect}`);
    if (tgi.length) nutriLines.push(`- TGI: ${tgi.join(' | ')}`);

    if (data.nutrition.isSurgical) {
        nutriLines.push(`- Cirúrgico: FO ${data.nutrition.operativeWound || 'sem obs'} | Drenos: ${data.nutrition.drainsAspect || 'sem obs'}`);
    }

    sections.push(`6. NUTRICIONAL:\n${nutriLines.join('\n')}`);

    // --- 8. PROFILAXIAS ---
    const profLines: string[] = [];
    profLines.push(`- TEV: ${data.prophylaxis.anticoagulation || 'Não prescrito'}`);
    profLines.push(`- Gástrica: ${data.prophylaxis.ibp || 'Não prescrito'}`);
    if (data.prophylaxis.others) profLines.push(`- Outros: ${data.prophylaxis.others}`);

    sections.push(`7. PROFILAXIAS:\n${profLines.join('\n')}`);

    // Junta todas as seções com duas quebras de linha para separação visual clara
    return sections.join('\n\n');
};