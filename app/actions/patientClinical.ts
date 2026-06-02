'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

// ============================================================
// 1. Atualizar o Histórico/Sintomas (Diagnóstico) do Paciente
//    Role = DOCTOR pode sobrescrever.
//    Role = NURSE pode apenas adicionar anotações (concatenar).
// ============================================================
export async function updatePatientCommentary(patientId: number, newCommentary: string, isNurseNote: boolean = false) {
    try {
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) return { success: false, error: 'Paciente não encontrado.' };

        let updatedText = newCommentary;

        if (isNurseNote) {
            const dateStr = new Date().toLocaleString('pt-BR');
            const noteBlock = `\n\n[Enfermagem - ${dateStr}]: ${newCommentary}`;
            updatedText = (patient.commentary || '') + noteBlock;
        }

        await prisma.patient.update({
            where: { id: patientId },
            data: { commentary: updatedText }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar comentário:', error);
        return { success: false, error: 'Falha ao salvar dados.' };
    }
}

// ============================================================
// 2. Atualizar Medicações da Última Evolução do Paciente
// ============================================================
export async function updateClinicalMedications(
    evolutionId: number | null, 
    patientId: number, 
    doctorId: number | null,
    hemoDrugs: any[], 
    antibiotics: any[]
) {
    try {
        if (!evolutionId) {
            // Se o paciente ainda não tiver evolução (e.g. recém-admitido), 
            // precisamos criar uma evolução "vazia" apenas com as medicações.
            if (!doctorId) {
                return { success: false, error: 'É necessário um médico associado para prescrever medicações.' };
            }
            
            const activeBed = await prisma.bed.findFirst({ where: { current_patient_id: patientId } });
            
            await prisma.clinicalEvolution.create({
                data: {
                    patient_id: patientId,
                    bed_id: activeBed?.id || 1, // Fallback
                    doctor_id: doctorId,
                    hemodynamic_drugs: hemoDrugs,
                    hemato_antibiotics: antibiotics,
                }
            });
        } else {
            // Atualizar evolução existente
            await prisma.clinicalEvolution.update({
                where: { id: evolutionId },
                data: {
                    hemodynamic_drugs: hemoDrugs,
                    hemato_antibiotics: antibiotics,
                }
            });
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar medicações:', error);
        return { success: false, error: 'Falha ao salvar medicações.' };
    }
}
