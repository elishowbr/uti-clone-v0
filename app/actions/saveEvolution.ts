'use server';

import prisma from '@/lib/prisma';

// Importando tipos dos componentes (Certifique-se que os caminhos estão corretos)
import { RespiratoryData } from '@/app/dashboard/[bedId]/evolution/components/forms/RespiratoryForm';
import { NeurologicalData } from '@/app/dashboard/[bedId]/evolution/components/forms/NeurologicalForm';
import { HemodynamicsData } from '@/app/dashboard/[bedId]/evolution/components/forms/HemodynamicsForm';
import { NutritionData } from '@/app/dashboard/[bedId]/evolution/components/forms/NutritionForm';
import { RenalData } from '@/app/dashboard/[bedId]/evolution/components/forms/RenalForm';
import { HematoinfectiousData } from '@/app/dashboard/[bedId]/evolution/components/forms/HematoinfectiousForm';
import { ProphylaxisData } from '@/app/dashboard/[bedId]/evolution/components/forms/ProphylaxisForm';
import { generateEvolutionText } from '@/app/dashboard/[bedId]/evolution/utils/generateEvolutionText';

interface FullFormData {
    general: { sex: string; height: string; weight: string; airwayType: string; };
    generatedText: string;
    respiratory: RespiratoryData;
    neurological: NeurologicalData;
    hemodynamics: HemodynamicsData;
    nutrition: NutritionData;
    renal: RenalData;
    hemato: HematoinfectiousData;
    prophylaxis: ProphylaxisData;
}

// TODO: Em produção, pegar o ID do médico da sessão (Auth)
const HARDCODED_DOCTOR_ID = 1;

export async function saveEvolution(data: FullFormData, bedId: number, patientId: number) {wwwwwwwwwwwwwwwwwww
    try {

        console.log(data.generatedText)
        // 1. Gerar Texto Consolidado (Para o campo generated_text)
        const generatedText = data.generatedText || generateEvolutionText(data);

        // Nutrição: Dieta
        const dietStr = data.nutrition.supports.map(s => s.support.name).join(', ');

        // Nutrição: Evacuação (Data + Aspecto)
        const evacuationStr = data.nutrition.lastEvacuationDate
            ? `${data.nutrition.lastEvacuationDate} - ${data.nutrition.evacuationAspect}`
            : data.nutrition.evacuationAspect;

        // 4. Salvar no Banco de Dados
        await prisma.clinicalEvolution.create({
            data: {
                bed_id: bedId,
                patient_id: patientId,
                doctor_id: HARDCODED_DOCTOR_ID,

                // --- GERAL ---
                patient_height: parseFloat(data.general.height) || null,
                patient_weight: parseFloat(data.general.weight) || null,

                // --- RESPIRATÓRIO ---
                airway_type: data.respiratory.airwayType,
                respiratory_support: data.respiratory.supports as any,
                respiratory_spo2: data.respiratory.spo2,
                respiratory_sao2: data.respiratory.sao2,
                respiratory_chest_xray: data.respiratory.chestXray,
                respiratory_observation: data.respiratory.observations,

                // --- NEUROLÓGICO ---
                neurologic_sedation: data.neurological.sedationDrugs as any, // Pode mapear escalas ou texto livre aqui
                neurologic_scales: data.neurological.neurologicalScales,
                neurologic_pupils: data.neurological.pupils,
                neurologic_bis: data.neurological.bis,
                neurologic_pic: data.neurological.pic,
                neurologic_enteral: data.neurological.enteralDrugs,
                neurologic_observation: data.neurological.subjectiveObservations,

                // --- HEMODINÂMICA ---
                hemodynamic_drugs: data.hemodynamics.vasoactiveDrugs as any,
                hemodynamic_pam: data.hemodynamics.pam,
                hemodynamic_fc: data.hemodynamics.fc,
                hemodynamic_rhythm: data.hemodynamics.rhythm,
                hemodynamic_enteral: data.hemodynamics.enteralDrugs,
                hemodynamic_tec: data.hemodynamics.tec,
                hemodynamic_lactate: data.hemodynamics.lactate,
                hemodynamic_svco2: data.hemodynamics.svco2,
                hemodynamic_gapco2: data.hemodynamics.gapco2,
                hemodynamic_observation: data.hemodynamics.observations,

                // --- RENAL/METABÓLICO ---
                renal_diuresis: data.renal.diuresis,
                renal_diuretics: data.renal.diuretics,
                renal_balance: data.renal.balance,
                renal_dialysis: data.renal.dialysis,
                renal_glycemia: data.renal.glycemia,
                renal_insulin: data.renal.insulin,
                renal_observation: data.renal.observations,

                // --- NUTRICIONAL ---
                nutrition_support: dietStr,
                nutrition_residue: data.nutrition.gastricResidue,
                nutrition_prokinetics: data.nutrition.prokineticsLaxatives,
                nutrition_evacuation: evacuationStr,
                nutrition_abdomen: data.nutrition.abdomen,
                nutrition_surgical: Boolean(data.nutrition.isSurgical), // Garante Boolean
                nutrition_drains: data.nutrition.drainsAspect,
                nutrition_wound: data.nutrition.operativeWound,

                // --- HEMATOINFECCIOSO ---
                hemato_antibiotics: data.hemato.antibiotics as any,
                hemato_cultures: data.hemato.cultures as any,
                hemato_temperature: data.hemato.temperature,
                hemato_biomarkers: data.hemato.biomarkers,
                hemato_corticoid: data.hemato.corticoids,
                hemato_observation: data.hemato.observations,

                // --- PROFILAXIAS ---
                prophylaxis_tev: data.prophylaxis.anticoagulation,
                prophylaxis_ibp: data.prophylaxis.ibp,
                prophylaxis_others: data.prophylaxis.others,

                // --- TEXTO GERADO ---
                generated_text: generatedText
            }
        });

        if (data.general.weight) {
            await prisma.patient.update({
                where: { id: patientId },
                data: { weight: parseFloat(data.general.weight) }
            });
        }

        return { success: true };

    } catch (error) {
        console.error("Erro ao salvar evolução:", error);
        return { success: false, error: String(error) };
    }
}