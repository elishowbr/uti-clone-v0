'use server';

import prisma from '@/lib/prisma'; // Verifique se o caminho do seu prisma client está aqui
import { revalidatePath } from 'next/cache';

// 1. Buscar dados para o Dashboard
export async function getDashboardData() {
    const beds = await prisma.bed.findMany({
        orderBy: { bed_number: 'asc' },
        include: {
            // Trazemos o paciente atual para mostrar no card
            current_patient: true, 
            clinical_evolutions: {
                take: 1,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    created_at: true,
                    generated_text: true,
                    hemodynamic_drugs: true,
                    hemato_antibiotics: true,
                    respiratory_observation: true,
                    neurologic_observation: true,
                }
            }
        }
    });
    return beds;
}

// 2. Criar um novo Leito
export async function createBed(bedNumber: number) {
    try {
        const existing = await prisma.bed.findFirst({ where: { bed_number: bedNumber, hospital_id: null } });
        if (existing) return { success: false, error: 'Número de leito já existe' };

        await prisma.bed.create({
            data: {
                bed_number: bedNumber,
                label: `Leito ${bedNumber < 10 ? '0' + bedNumber : bedNumber}`,
                type: 'UTI Geral',
                status: 'VACANT', // Enum correto
            }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar leito:", error);
        return { success: false, error: 'Erro ao criar leito' };
    }
}

// 3. Admitir Paciente (Ocupar leito)
export async function admitPatient(bedId: number, patientName: string, commentary?: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // A. Criar o Paciente
            const newPatient = await tx.patient.create({
                data: {
                    name: patientName,
                    admission_date: new Date(),
                    commentary: commentary || null,
                }
            });

            // B. Atualizar o Leito vinculando o paciente e mudando status
            await tx.bed.update({
                where: { id: bedId },
                data: {
                    status: 'OCCUPIED', // Enum Prisma
                    current_patient_id: newPatient.id
                }
            });
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Erro na admissão:", error);
        return { success: false, error: 'Falha ao admitir paciente' };
    }
}

// 4. Alta (Desocupar leito)
export async function dischargePatient(bedId: number) {
    try {
        const bed = await prisma.bed.findUnique({
            where: { id: bedId },
            select: { current_patient_id: true }
        });

        if (!bed) return { success: false, error: "Leito não encontrado" };

        await prisma.$transaction(async (tx) => {
            // A. Data de alta no paciente
            if (bed.current_patient_id) {
                await tx.patient.update({
                    where: { id: bed.current_patient_id },
                    data: { discharge_date: new Date() }
                });
            }

            // B. Liberar o leito → VACANT diretamente (sem etapa de limpeza obrigatória)
            await tx.bed.update({
                where: { id: bedId },
                data: {
                    status: 'VACANT',
                    current_patient_id: null
                }
            });
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao processar alta' };
    }
}

// 5. Finalizar Limpeza (Tornar Vago)
export async function finishCleaning(bedId: number) {
    try {
        await prisma.bed.update({
            where: { id: bedId },
            data: { status: 'VACANT' }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao liberar leito' };
    }
}

export async function setBedToCleaning(bedId: number) {
    try {
        await prisma.bed.update({
            where: { id: bedId },
            data: {
                status: 'CLEANING',
                // Garante que não tem paciente, apenas por segurança
                current_patient_id: null
            }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao enviar leito para limpeza' };
    }
}

// ─── Hospital-Specific Dashboard Functions ────────────────────────────────────

export async function getHospitalDashboardData(hospitalId: number) {
    const beds = await prisma.bed.findMany({
        where: { hospital_id: hospitalId },
        orderBy: { bed_number: 'asc' },
        include: {
            current_patient: true,
            clinical_evolutions: {
                take: 1,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    created_at: true,
                    generated_text: true,
                    hemodynamic_drugs: true,
                    hemato_antibiotics: true,
                    respiratory_observation: true,
                    neurologic_observation: true,
                },
            },
        },
    });
    return beds;
}

export async function createHospitalBed(hospitalId: number, customLabel?: string) {
    try {
        const existingBeds = await prisma.bed.findMany({
            where: { hospital_id: hospitalId },
            select: { bed_number: true },
        });
        const nextNum = existingBeds.length > 0
            ? Math.max(...existingBeds.map(b => b.bed_number)) + 1
            : 1;

        await prisma.bed.create({
            data: {
                bed_number: nextNum,
                label: customLabel?.trim() || `Leito ${nextNum < 10 ? '0' + nextNum : nextNum}`,
                type: 'UTI Geral',
                status: 'VACANT',
                hospital_id: hospitalId,
            },
        });
        revalidatePath(`/${hospitalId}/dashboard`);
        revalidatePath('/admin/hospitais');
        return { success: true };
    } catch (error) {
        console.error('Erro ao criar leito:', error);
        return { success: false, error: 'Erro ao criar leito' };
    }
}

export async function updateBedLabel(bedId: number, label: string) {
    try {
        if (!label.trim()) return { success: false, error: 'O nome do leito não pode estar vazio.' };
        await prisma.bed.update({
            where: { id: bedId },
            data: { label: label.trim() }
        });
        revalidatePath('/admin/hospitais');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar leito:', error);
        return { success: false, error: 'Erro ao atualizar o leito.' };
    }
}

export async function deleteHospitalBed(bedId: number, hospitalId: number) {
    try {
        const bed = await prisma.bed.findUnique({ where: { id: bedId } });
        if (!bed) return { success: false, error: 'Leito não encontrado' };
        if (bed.status === 'OCCUPIED') return { success: false, error: 'Não é possível excluir um leito ocupado.' };

        await prisma.bed.delete({ where: { id: bedId } });
        revalidatePath(`/${hospitalId}/dashboard`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro ao excluir. O leito pode ter histórico clínico vinculado.' };
    }
}

export async function deleteBed(bedId: number) {
    try {
        // Verificação de segurança: O leito deve estar vazio
        const bed = await prisma.bed.findUnique({ where: { id: bedId } });

        if (!bed) return { success: false, error: 'Leito não encontrado' };
        if (bed.status == 'OCCUPIED') return { success: false, error: 'Não é possível excluir um leito ocupado.' };

        // Se houver histórico (ClinicalEvolution), o Prisma pode bloquear dependendo da configuração (Referential Integrity).
        // Se quiser apagar TUDO (histórico incluído), precisaria de onDelete: Cascade no Schema.
        // Por segurança, vamos tentar deletar. Se falhar por FK, avisamos.

        await prisma.bed.delete({
            where: { id: bedId }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro ao excluir. O leito pode ter histórico clínico vinculado.' };
    }
}