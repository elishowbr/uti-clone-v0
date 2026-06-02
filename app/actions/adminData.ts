'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

// ============================================
// Tipos para o painel admin
// ============================================

export type AdminDoctorProfile = {
    id: number;
    name: string;
    initials: string;
    crm: string;
    position: string;
};

export type AdminKpis = {
    totalPatients: number;
    bedsOccupied: number;
    bedsVacant: number;
    bedsCleaning: number;
    bedsTotal: number;
    occupancyRate: number;
    pendingEvolutions: number;
    recentEvolutionsToday: number;
};

export type AdminPatient = {
    id: number;
    name: string;
    bedLabel: string;
    bedId: number;
    admissionDate: string;
    lastEvolutionAt: string | null;
    hasPendingEvolution: boolean;
    daysInUTI: number;
};

export type AdminActivity = {
    id: number;
    kind: 'EVOLUTION' | 'ADMISSION' | 'DISCHARGE';
    title: string;
    description: string;
    occurredAt: string;
};

// ============================================
// 1. Perfil do médico logado
// ============================================
export async function getDoctorProfile(): Promise<AdminDoctorProfile | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        const payload = await verifySession(sessionCookie);

        if (!payload?.userId) return null;

        const doctor = await prisma.doctor.findFirst({
            where: { user_id: String(payload.userId) },
        });

        if (!doctor) {
            // Fallback: retorna dados do User se não for Doctor
            const user = await prisma.user.findUnique({
                where: { id: Number(payload.userId) },
            });
            if (!user) return null;

            const nameParts = user.name.split(' ');
            const initials = nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                : user.name.substring(0, 2);

            return {
                id: user.id,
                name: user.name,
                initials: initials.toUpperCase(),
                crm: '—',
                position: user.role === 'ADMIN' ? 'Administrador' : user.role === 'MANAGER' ? 'Gestor Hospitalar' : user.role === 'NURSE' ? 'Enfermeiro UTI' : 'Profissional de Saúde',
            };
        }

        const nameParts = doctor.name.split(' ');
        const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : doctor.name.substring(0, 2);

        return {
            id: doctor.id,
            name: doctor.name,
            initials: initials.toUpperCase(),
            crm: doctor.crm,
            position: doctor.position,
        };
    } catch (error) {
        console.error('Erro ao buscar perfil do médico:', error);
        return null;
    }
}

// ============================================
// 2. KPIs do painel admin
// ============================================
export async function getAdminKpis(): Promise<AdminKpis> {
    try {
        const beds = await prisma.bed.findMany({
            select: { status: true, current_patient_id: true },
        });

        const bedsTotal = beds.length;
        const bedsOccupied = beds.filter(b => b.status === 'OCCUPIED').length;
        const bedsVacant = beds.filter(b => b.status === 'VACANT').length;
        const bedsCleaning = beds.filter(b => b.status === 'CLEANING').length;
        const occupancyRate = bedsTotal > 0 ? Math.round((bedsOccupied / bedsTotal) * 100) : 0;

        // Pacientes internados (com leito ocupado)
        const totalPatients = bedsOccupied;

        // Evoluções feitas hoje
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const evolutionsToday = await prisma.clinicalEvolution.count({
            where: { created_at: { gte: todayStart } },
        });

        // Pacientes sem evolução hoje (pendentes)
        const occupiedBeds = await prisma.bed.findMany({
            where: { status: 'OCCUPIED', current_patient_id: { not: null } },
            select: { current_patient_id: true },
        });

        const patientIds = occupiedBeds
            .map(b => b.current_patient_id)
            .filter((id): id is number => id !== null);

        let pendingEvolutions = 0;
        if (patientIds.length > 0) {
            const patientsWithEvoToday = await prisma.clinicalEvolution.findMany({
                where: {
                    patient_id: { in: patientIds },
                    created_at: { gte: todayStart },
                },
                select: { patient_id: true },
                distinct: ['patient_id'],
            });

            const evolvedPatientIds = new Set(patientsWithEvoToday.map(e => e.patient_id));
            pendingEvolutions = patientIds.filter(id => !evolvedPatientIds.has(id)).length;
        }

        return {
            totalPatients,
            bedsOccupied,
            bedsVacant,
            bedsCleaning,
            bedsTotal,
            occupancyRate,
            pendingEvolutions,
            recentEvolutionsToday: evolutionsToday,
        };
    } catch (error) {
        console.error('Erro ao buscar KPIs:', error);
        return {
            totalPatients: 0,
            bedsOccupied: 0,
            bedsVacant: 0,
            bedsCleaning: 0,
            bedsTotal: 0,
            occupancyRate: 0,
            pendingEvolutions: 0,
            recentEvolutionsToday: 0,
        };
    }
}

// ============================================
// 3. Lista de pacientes internados
// ============================================
export async function getAdminPatients(): Promise<AdminPatient[]> {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const occupiedBeds = await prisma.bed.findMany({
            where: { status: 'OCCUPIED', current_patient_id: { not: null } },
            include: {
                current_patient: {
                    include: {
                        evolutions: {
                            take: 1,
                            orderBy: { created_at: 'desc' },
                            select: { created_at: true },
                        },
                    },
                },
            },
            orderBy: { bed_number: 'asc' },
        });

        return occupiedBeds
            .filter(bed => bed.current_patient !== null)
            .map(bed => {
                const patient = bed.current_patient!;
                const lastEvo = patient.evolutions[0] ?? null;
                const lastEvoDate = lastEvo ? new Date(lastEvo.created_at) : null;
                const hasPendingEvolution = !lastEvoDate || lastEvoDate < todayStart;

                const admissionDate = new Date(patient.admission_date);
                const now = new Date();
                const daysInUTI = Math.max(1, Math.ceil((now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)));

                return {
                    id: patient.id,
                    name: patient.name,
                    bedLabel: bed.label || `Leito ${bed.bed_number}`,
                    bedId: bed.id,
                    admissionDate: patient.admission_date.toISOString(),
                    lastEvolutionAt: lastEvoDate?.toISOString() ?? null,
                    hasPendingEvolution,
                    daysInUTI,
                };
            });
    } catch (error) {
        console.error('Erro ao buscar pacientes admin:', error);
        return [];
    }
}

// ============================================
// 4. Feed de atividades recentes
// ============================================
export async function getRecentActivity(limit: number = 10): Promise<AdminActivity[]> {
    try {
        const recentEvolutions = await prisma.clinicalEvolution.findMany({
            take: limit,
            orderBy: { created_at: 'desc' },
            include: {
                patient: { select: { name: true } },
                doctor: { select: { name: true } },
                bed: { select: { label: true, bed_number: true } },
            },
        });

        return recentEvolutions.map(evo => ({
            id: evo.id,
            kind: 'EVOLUTION' as const,
            title: 'Evolução registrada',
            description: `${evo.patient.name} (${evo.bed.label || `Leito ${evo.bed.bed_number}`}) — ${evo.doctor.name}`,
            occurredAt: evo.created_at.toISOString(),
        }));
    } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        return [];
    }
}

// ============================================
// 5. Role do usuário logado (para RBAC no client)
// ============================================
export async function getCurrentUserRole(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        const payload = await verifySession(sessionCookie);
        if (!payload?.userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: Number(payload.userId) },
            select: { role: true },
        });
        return user?.role ?? null;
    } catch {
        return null;
    }
}
