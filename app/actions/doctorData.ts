'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

// ============================================================
// Tipos exportados para o painel do médico
// ============================================================

export type DoctorProfile = {
    id: number;
    userId: string;
    name: string;
    email: string;
    initials: string;
    crm: string;
    position: string;
};

export type DoctorKpis = {
    evolutionsToday: number;
    patientsThisWeek: number;
    evolutionsThisMonth: number;
    activePatients: number;
};

export type DoctorPatient = {
    id: number;
    name: string;
    bedLabel: string;
    bedId: number | null;
    admissionDate: string;
    daysInUTI: number;
    lastEvolutionByDoctorAt: string | null;
    evolvedTodayByDoctor: boolean;
    isActive: boolean; // ainda internado
};

export type DoctorEvolution = {
    id: number;
    patientId: number;
    patientName: string;
    bedLabel: string;
    createdAt: string;
    generatedText: string | null;
    // Campos clínicos principais para preview no modal
    airwayType: string | null;
    respiratorySupport: unknown;
    respiratorySpo2: string | null;
    neurologicSedation: unknown;
    neurologicScales: string | null;
    hemodynamicDrugs: unknown;
    hemodynamicPam: string | null;
    hemodynamicFc: string | null;
    renalDialysis: string | null;
    renalDiuresis: string | null;
    nutritionSupport: string | null;
    hematoAntibiotics: unknown;
    hematoTemperature: string | null;
    prophylaxisTev: string | null;
    prophylaxisIbp: string | null;
};

// ============================================================
// Helper interno: resolve o Doctor a partir da sessão JWT
// ============================================================
async function resolveDoctor() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const payload = await verifySession(sessionCookie);

    if (!payload?.userId) return null;

    const doctor = await prisma.doctor.findFirst({
        where: { user_id: String(payload.userId) },
    });

    return doctor;
}

// ============================================================
// 1. Perfil do médico logado
// ============================================================
export async function getDoctorProfileForPanel(): Promise<DoctorProfile | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        const payload = await verifySession(sessionCookie);
        if (!payload?.userId) return null;

        const [doctor, user] = await Promise.all([
            prisma.doctor.findFirst({ where: { user_id: String(payload.userId) } }),
            prisma.user.findUnique({ where: { id: Number(payload.userId) }, select: { email: true } }),
        ]);

        if (!doctor) return null;

        const nameParts = doctor.name.trim().split(' ');
        const initials =
            nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                : doctor.name.substring(0, 2);

        return {
            id: doctor.id,
            userId: doctor.user_id,
            name: doctor.name,
            email: user?.email ?? '',
            initials: initials.toUpperCase(),
            crm: doctor.crm,
            position: doctor.position,
        };
    } catch (error) {
        console.error('Erro ao buscar perfil do médico:', error);
        return null;
    }
}

// ============================================================
// 2. KPIs pessoais do médico
// ============================================================
export async function getDoctorKpis(): Promise<DoctorKpis> {
    const empty: DoctorKpis = {
        evolutionsToday: 0,
        patientsThisWeek: 0,
        evolutionsThisMonth: 0,
        activePatients: 0,
    };

    try {
        const doctor = await resolveDoctor();
        if (!doctor) return empty;

        const now = new Date();

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [evolutionsToday, evosThisWeek, evolutionsThisMonth] = await Promise.all([
            prisma.clinicalEvolution.count({
                where: { doctor_id: doctor.id, created_at: { gte: todayStart } },
            }),
            prisma.clinicalEvolution.findMany({
                where: { doctor_id: doctor.id, created_at: { gte: weekStart } },
                select: { patient_id: true },
                distinct: ['patient_id'],
            }),
            prisma.clinicalEvolution.count({
                where: { doctor_id: doctor.id, created_at: { gte: monthStart } },
            }),
        ]);

        // Pacientes ativos = que têm leito ocupado e pelo menos 1 evolução do médico
        const activeBedsWithPatient = await prisma.bed.findMany({
            where: { status: 'OCCUPIED', current_patient_id: { not: null } },
            select: { current_patient_id: true },
        });
        const activePatientIds = activeBedsWithPatient
            .map((b) => b.current_patient_id)
            .filter((id): id is number => id !== null);

        const activeWithEvo = await prisma.clinicalEvolution.findMany({
            where: {
                doctor_id: doctor.id,
                patient_id: { in: activePatientIds },
            },
            select: { patient_id: true },
            distinct: ['patient_id'],
        });

        return {
            evolutionsToday,
            patientsThisWeek: evosThisWeek.length,
            evolutionsThisMonth,
            // TASK 4 FIX: count ALL occupied beds — matches /medico/patients list
            activePatients: activePatientIds.length,
        };
    } catch (error) {
        console.error('Erro ao buscar KPIs do médico:', error);
        return empty;
    }
}

// ============================================================
// 3. Lista de pacientes atendidos pelo médico
// ============================================================
export async function getDoctorPatients(): Promise<DoctorPatient[]> {
    try {
        const doctor = await resolveDoctor();
        if (!doctor) return [];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Busca todas as evoluções do médico, agrupando por paciente
        const evolutions = await prisma.clinicalEvolution.findMany({
            where: { doctor_id: doctor.id },
            orderBy: { created_at: 'desc' },
            include: {
                patient: {
                    include: {
                        current_bed: {
                            select: { id: true, label: true, bed_number: true, status: true },
                        },
                    },
                },
            },
        });

        // Deduplica por paciente, mantendo a última evolução do médico
        const seenPatients = new Map<number, DoctorPatient>();

        for (const evo of evolutions) {
            if (seenPatients.has(evo.patient_id)) continue;

            const patient = evo.patient;
            const bed = patient.current_bed;
            const isActive = bed !== null && bed.status === 'OCCUPIED';
            const admissionDate = new Date(patient.admission_date);
            const now = new Date();
            const daysInUTI = Math.max(1, Math.ceil((now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)));
            const evolvedToday = new Date(evo.created_at) >= todayStart;

            seenPatients.set(evo.patient_id, {
                id: patient.id,
                name: patient.name,
                bedLabel: bed ? (bed.label ?? `Leito ${bed.bed_number}`) : 'Alta / Transferido',
                bedId: bed?.id ?? null,
                admissionDate: patient.admission_date.toISOString(),
                daysInUTI,
                lastEvolutionByDoctorAt: evo.created_at.toISOString(),
                evolvedTodayByDoctor: evolvedToday,
                isActive,
            });
        }

        // Ordena: ativos primeiro, depois por último atendimento
        return Array.from(seenPatients.values()).sort((a, b) => {
            if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
            const dateA = a.lastEvolutionByDoctorAt ?? '';
            const dateB = b.lastEvolutionByDoctorAt ?? '';
            return dateB.localeCompare(dateA);
        });
    } catch (error) {
        console.error('Erro ao buscar pacientes do médico:', error);
        return [];
    }
}

// ============================================================
// 4. Histórico paginado de evoluções do médico
// ============================================================
export async function getDoctorEvolutions(
    page: number = 1,
    search: string = '',
    periodDays: number = 30
): Promise<{ data: DoctorEvolution[]; total: number }> {
    try {
        const doctor = await resolveDoctor();
        if (!doctor) return { data: [], total: 0 };

        const PAGE_SIZE = 15;
        const skip = (page - 1) * PAGE_SIZE;

        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - periodDays);
        periodStart.setHours(0, 0, 0, 0);

        const whereClause = {
            doctor_id: doctor.id,
            created_at: { gte: periodStart },
            ...(search.trim()
                ? {
                      patient: {
                          name: { contains: search.trim(), mode: 'insensitive' as const },
                      },
                  }
                : {}),
        };

        const [rawEvolutions, total] = await Promise.all([
            prisma.clinicalEvolution.findMany({
                where: whereClause,
                orderBy: { created_at: 'desc' },
                skip,
                take: PAGE_SIZE,
                include: {
                    patient: { select: { id: true, name: true } },
                    bed: { select: { label: true, bed_number: true } },
                },
            }),
            prisma.clinicalEvolution.count({ where: whereClause }),
        ]);

        const data: DoctorEvolution[] = rawEvolutions.map((evo) => ({
            id: evo.id,
            patientId: evo.patient_id,
            patientName: evo.patient.name,
            bedLabel: evo.bed.label ?? `Leito ${evo.bed.bed_number}`,
            createdAt: evo.created_at.toISOString(),
            generatedText: evo.generated_text,
            airwayType: evo.airway_type,
            respiratorySupport: evo.respiratory_support,
            respiratorySpo2: evo.respiratory_spo2,
            neurologicSedation: evo.neurologic_sedation,
            neurologicScales: evo.neurologic_scales,
            hemodynamicDrugs: evo.hemodynamic_drugs,
            hemodynamicPam: evo.hemodynamic_pam,
            hemodynamicFc: evo.hemodynamic_fc,
            renalDialysis: evo.renal_dialysis,
            renalDiuresis: evo.renal_diuresis,
            nutritionSupport: evo.nutrition_support,
            hematoAntibiotics: evo.hemato_antibiotics,
            hematoTemperature: evo.hemato_temperature,
            prophylaxisTev: evo.prophylaxis_tev,
            prophylaxisIbp: evo.prophylaxis_ibp,
        }));

        return { data, total };
    } catch (error) {
        console.error('Erro ao buscar evoluções do médico:', error);
        return { data: [], total: 0 };
    }
}

// ============================================================
// 5. Feed de atividade recente (últimas evoluções)
// ============================================================
export async function getDoctorRecentActivity(limit: number = 5): Promise<DoctorEvolution[]> {
    try {
        const doctor = await resolveDoctor();
        if (!doctor) return [];

        const rawEvolutions = await prisma.clinicalEvolution.findMany({
            where: { doctor_id: doctor.id },
            orderBy: { created_at: 'desc' },
            take: limit,
            include: {
                patient: { select: { id: true, name: true } },
                bed: { select: { label: true, bed_number: true } },
            },
        });

        return rawEvolutions.map((evo) => ({
            id: evo.id,
            patientId: evo.patient_id,
            patientName: evo.patient.name,
            bedLabel: evo.bed.label ?? `Leito ${evo.bed.bed_number}`,
            createdAt: evo.created_at.toISOString(),
            generatedText: evo.generated_text,
            airwayType: evo.airway_type,
            respiratorySupport: evo.respiratory_support,
            respiratorySpo2: evo.respiratory_spo2,
            neurologicSedation: evo.neurologic_sedation,
            neurologicScales: evo.neurologic_scales,
            hemodynamicDrugs: evo.hemodynamic_drugs,
            hemodynamicPam: evo.hemodynamic_pam,
            hemodynamicFc: evo.hemodynamic_fc,
            renalDialysis: evo.renal_dialysis,
            renalDiuresis: evo.renal_diuresis,
            nutritionSupport: evo.nutrition_support,
            hematoAntibiotics: evo.hemato_antibiotics,
            hematoTemperature: evo.hemato_temperature,
            prophylaxisTev: evo.prophylaxis_tev,
            prophylaxisIbp: evo.prophylaxis_ibp,
        }));
    } catch (error) {
        console.error('Erro ao buscar atividade recente do médico:', error);
        return [];
    }
}

// ============================================================
// 6. Hospitais disponíveis para o médico (taxa de ocupação real)
// ============================================================

export type DoctorHospital = {
    id: number;
    name: string;
    address: string;
    totalBeds: number;
    occupiedBeds: number;
    vacantBeds: number;
};

export async function getDoctorHospitals(): Promise<DoctorHospital[]> {
    try {
        const hospitals = await prisma.hospital.findMany({
            include: { beds: { select: { status: true } } },
            orderBy: { name: 'asc' },
        });
        return hospitals.map(h => ({
            id: h.id,
            name: h.name,
            address: h.address,
            totalBeds: h.beds.length,
            occupiedBeds: h.beds.filter(b => b.status === 'OCCUPIED').length,
            vacantBeds: h.beds.filter(b => b.status === 'VACANT').length,
        }));
    } catch (error) {
        console.error('Erro ao buscar hospitais:', error);
        return [];
    }
}

// ============================================================
// 7. Hospital principal do médico (último onde trabalhou)
// ============================================================

export async function getDoctorMainHospital(): Promise<{ id: number; name: string } | null> {
    try {
        const doctor = await resolveDoctor();
        if (!doctor) return null;

        const lastEvo = await prisma.clinicalEvolution.findFirst({
            where: { doctor_id: doctor.id },
            orderBy: { created_at: 'desc' },
            select: {
                bed: {
                    select: {
                        hospital: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return lastEvo?.bed?.hospital ?? null;
    } catch {
        return null;
    }
}

// ============================================================
// 8. TODOS os pacientes internados na UTI (Relatório clínico)
//    Independente de o médico logado ter evoluído ou não.
// ============================================================
export type UtiPatient = {
    id: number;
    name: string;
    bedLabel: string;
    bedId: number;
    admissionDate: string;
    daysInUTI: number;
    commentary: string | null;         // Anotação clínica do paciente
    lastEvolutionAt: string | null;    // Última evolução (qualquer médico)
    lastEvolutionText: string | null;  // Texto gerado
    lastDoctorName: string | null;     // Médico da última evolução
    evolvedTodayByCurrentDoctor: boolean; // Médico logado evoluiu hoje?
};

export async function getAllUtiPatients(): Promise<UtiPatient[]> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        const payload = await verifySession(sessionCookie);

        // Resolve o médico logado (pode ser null se for enfermeiro)
        const currentDoctor = payload?.userId
            ? await prisma.doctor.findFirst({ where: { user_id: String(payload.userId) } })
            : null;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const occupiedBeds = await prisma.bed.findMany({
            where: { status: 'OCCUPIED', current_patient_id: { not: null } },
            orderBy: { bed_number: 'asc' },
            include: {
                current_patient: {
                    include: {
                        evolutions: {
                            take: 1,
                            orderBy: { created_at: 'desc' },
                            include: {
                                doctor: { select: { name: true, id: true } },
                            },
                        },
                    },
                },
            },
        });

        return occupiedBeds
            .filter((bed) => bed.current_patient !== null)
            .map((bed) => {
                const patient = bed.current_patient!;
                const lastEvo = patient.evolutions[0] ?? null;
                const admissionDate = new Date(patient.admission_date);
                const now = new Date();
                const daysInUTI = Math.max(
                    1,
                    Math.ceil((now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24))
                );

                const evolvedTodayByCurrentDoctor =
                    currentDoctor !== null &&
                    lastEvo !== null &&
                    lastEvo.doctor.id === currentDoctor.id &&
                    new Date(lastEvo.created_at) >= todayStart;

                return {
                    id: patient.id,
                    name: patient.name,
                    bedLabel: bed.label ?? `Leito ${bed.bed_number}`,
                    bedId: bed.id,
                    admissionDate: patient.admission_date.toISOString(),
                    daysInUTI,
                    commentary: patient.commentary,
                    lastEvolutionAt: lastEvo ? lastEvo.created_at.toISOString() : null,
                    lastEvolutionText: lastEvo ? lastEvo.generated_text : null,
                    lastDoctorName: lastEvo ? lastEvo.doctor.name : null,
                    evolvedTodayByCurrentDoctor,
                };
            });
    } catch (error) {
        console.error('Erro ao buscar pacientes da UTI:', error);
        return [];
    }
}
