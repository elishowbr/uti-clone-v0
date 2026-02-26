'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getBedDetails(bedId: number) {
    try {
        const bed = await prisma.bed.findUnique({
            where: { id: bedId },
            include: {
                current_patient: {
                    include: {
                        evolutions: {
                            orderBy: { created_at: 'desc' }, // As mais novas primeiro
                            include: {
                                doctor: {
                                    select: { name: true } // Trazemos apenas o nome do médico para exibir no card
                                }
                            }
                        }
                    }
                }
            }
        });

        return bed;
    } catch (error) {
        console.error("Erro ao buscar detalhes do leito:", error);
        return null;
    }
}

// Busca os dados do paciente que está ocupando um leito específico
export async function getPatientFromBed(bedId: number) {
    try {
        const bed = await prisma.bed.findUnique({
            where: { id: bedId },
            include: {
                current_patient: true // Traz os dados do paciente (nome, idade, etc)
            }
        });

        if (!bed || !bed.current_patient) {
            return { success: false, error: 'Leito vazio ou não encontrado' };
        }

        return { success: true, patient: bed.current_patient, bedLabel: bed.label || `Leito ${bed.bed_number}` };
    } catch (error) {
        console.error("Erro ao buscar paciente:", error);
        return { success: false, error: 'Erro de conexão' };
    }
}

// Busca a última evolução para o recurso de "Copiar Dados" (Pre-fill)
export async function getLastEvolution(patientId: number) {
    try {
        const lastEvo = await prisma.clinicalEvolution.findFirst({
            where: { patient_id: patientId },
            orderBy: { created_at: 'desc' }
        });
        return lastEvo;
    } catch (error) {
        return null;
    }
}

export async function savePatientData(bedId: number, data: any) {
    try {
        const bed = await prisma.bed.findUnique({
            where: { id: bedId },
        });

        if (!bed || !bed.current_patient_id) {
            return { success: false, error: 'Leito vazio ou não encontrado' };
        }

        const update = await prisma.patient.update({
            where: { id: bed.current_patient_id },
            data: {
                name: data.name,
                height: data.height ? Number(data.height) : null,
                gender: data.gender,
                birth_date: data.birth_date ? new Date(data.birth_date) : null,
                arrival_date: data.arrival_date ? new Date(data.arrival_date) : null,
                commentary: data.commentary
            }
        })
        revalidatePath(`/dashboard/${bedId}`);

        return { success: true, patient: update };
    } catch (error) {
        console.error("Erro ao salvar dados do paciente:", error);
        return { success: false, error: 'Erro ao salvar dados' };
    }
}