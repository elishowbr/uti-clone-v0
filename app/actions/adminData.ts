'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// ============================================
// Tipos para o painel admin
// ============================================

export type AdminDoctorProfile = {
    id: number;
    name: string;
    email: string;
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

        const user = await prisma.user.findUnique({
            where: { id: Number(payload.userId) },
            select: { id: true, name: true, email: true, role: true },
        });
        if (!user) return null;

        const doctor = await prisma.doctor.findFirst({
            where: { user_id: String(payload.userId) },
        });

        const sourceName = doctor?.name ?? user.name;
        const nameParts = sourceName.trim().split(' ');
        const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : sourceName.substring(0, 2);

        const ROLE_POSITION: Record<string, string> = {
            ADMIN: 'Administrador', MANAGER: 'Gestor Hospitalar',
            NURSE: 'Enfermeiro UTI', DOCTOR: 'Médico',
        };

        return {
            id: user.id,
            name: sourceName,
            email: user.email,
            initials: initials.toUpperCase(),
            crm: doctor?.crm ?? '—',
            position: doctor?.position ?? ROLE_POSITION[user.role] ?? 'Profissional de Saúde',
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

// ============================================
// 6. CRUD de Hospitais
// ============================================


export async function createHospital(data: {
    name: string;
    address: string;
    description?: string;
    bed_count?: number | null;
}): Promise<{ success: boolean; error?: string }> {
    try {
        if (!data.name?.trim() || !data.address?.trim()) {
            return { success: false, error: 'Nome e endereço são obrigatórios.' };
        }

        const bedCount = data.bed_count ? Number(data.bed_count) : 0;

        const hospital = await prisma.hospital.create({
            data: {
                name:           data.name.trim(),
                address:        data.address.trim(),
                description:    data.description?.trim() || null,
                available_beds: bedCount > 0 ? bedCount : null,
            },
        });

        if (bedCount > 0) {
            const agg = await prisma.bed.aggregate({ _max: { bed_number: true } });
            const startNumber = (agg._max.bed_number ?? 0) + 1;

            await prisma.bed.createMany({
                data: Array.from({ length: bedCount }, (_, i) => ({
                    bed_number:  startNumber + i,
                    label:       `Leito ${String(startNumber + i).padStart(2, '0')}`,
                    type:        'UTI Geral',
                    status:      'VACANT' as const,
                    hospital_id: hospital.id,
                })),
            });
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Erro ao criar hospital:', error);
        return { success: false, error: 'Falha ao criar hospital.' };
    }
}

// ============================================
// 8. Cadastrar médico (User + Doctor record)
// ============================================

export async function createDoctorAccount(data: {
    name: string;
    email: string;
    password: string;
    crm: string;
    position: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const { name, email, password, crm, position } = data;

        if (!name?.trim() || !email?.trim() || !password || !crm?.trim() || !position?.trim()) {
            return { success: false, error: 'Todos os campos são obrigatórios.' };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { success: false, error: 'E-mail inválido.' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Senha deve ter ao menos 6 caracteres.' };
        }

        const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
        if (existing) {
            return { success: false, error: 'E-mail já cadastrado no sistema.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name:     name.trim(),
                email:    email.trim(),
                password: hashedPassword,
                role:     'DOCTOR',
            },
        });

        await prisma.doctor.create({
            data: {
                user_id:  String(user.id),
                name:     name.trim(),
                crm:      crm.trim(),
                position: position.trim(),
            },
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Erro ao cadastrar médico:', error);
        return { success: false, error: 'Falha ao cadastrar médico.' };
    }
}

export async function deleteHospital(hospitalId: number): Promise<{ success: boolean; error?: string }> {
    try {
        const hospital = await prisma.hospital.findUnique({
            where: { id: hospitalId },
            include: { beds: { where: { current_patient_id: { not: null } } } },
        });
        if (!hospital || !hospital.active) return { success: false, error: 'Hospital não encontrado.' };
        if (hospital.beds.length > 0) {
            return { success: false, error: 'Não é possível excluir: há pacientes internados nesta unidade.' };
        }
        
        // Soft delete the hospital
        await prisma.hospital.update({
            where: { id: hospitalId },
            data: { active: false },
        });
        
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir hospital:', error);
        return { success: false, error: 'Falha ao excluir hospital.' };
    }
}



// ============================================
// 8. Todos os membros cadastrados (lista geral)
// ============================================

export type TeamMember = {
    id: number;
    name: string;
    email: string;
    role: string;
    initials: string;
};

// ============================================
// 9. Hospitais acessíveis pela enfermeira logada
// ============================================

export type NurseHospital = {
    id: number;
    name: string;
    address: string;
    totalBeds: number;
    occupiedBeds: number;
};

export async function getNurseHospitals(): Promise<NurseHospital[]> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        const payload = await verifySession(sessionCookie);
        if (!payload?.userId) return [];

        const records = await prisma.hospitalUser.findMany({
            where: { user_id: Number(payload.userId), hospital: { active: true } },
            include: {
                hospital: {
                    include: { beds: { select: { status: true } } },
                },
            },
            orderBy: { hospital: { name: 'asc' } },
        });

        return records.map(r => ({
            id: r.hospital.id,
            name: r.hospital.name,
            address: r.hospital.address,
            totalBeds: r.hospital.beds.length,
            occupiedBeds: r.hospital.beds.filter(b => b.status === 'OCCUPIED').length,
        }));
    } catch (error) {
        console.error('Erro ao buscar hospitais da enfermeira:', error);
        return [];
    }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
    try {
        const users = await prisma.user.findMany({
            where: { active: true },
            orderBy: [{ role: 'asc' }, { name: 'asc' }],
            select: { id: true, name: true, email: true, role: true },
        });
        return users.map(u => {
            const parts = u.name.trim().split(' ');
            const initials = parts.length >= 2
                ? `${parts[0][0]}${parts[parts.length - 1][0]}`
                : u.name.substring(0, 2);
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                initials: initials.toUpperCase(),
            };
        });
    } catch (error) {
        console.error('Erro ao buscar membros da equipe:', error);
        return [];
    }
}
export type DoctorData = {
    id: number;
    userId: number;
    name: string;
    email: string;
    crm: string;
    position: string;
    initials: string;
};

export async function getAllDoctors(): Promise<DoctorData[]> {
    try {
        const doctors = await prisma.doctor.findMany({
            orderBy: { name: 'asc' },
        });

        const userIds = doctors.map(d => Number(d.user_id)).filter(id => !isNaN(id));

        const users = await prisma.user.findMany({
            where: { id: { in: userIds }, active: true },
            select: { id: true, email: true },
        });

        const userEmailMap = new Map(users.map(u => [String(u.id), u.email]));

        // Filter out doctors whose users are inactive
        const activeDoctors = doctors.filter(d => userEmailMap.has(String(d.user_id)));

        return activeDoctors.map(d => {
            const parts = d.name.trim().split(' ');
            const initials = parts.length >= 2
                ? `${parts[0][0]}${parts[parts.length - 1][0]}`
                : d.name.substring(0, 2);
            return {
                id: d.id,
                userId: Number(d.user_id),
                name: d.name,
                email: userEmailMap.get(d.user_id) ?? '',
                crm: d.crm,
                position: d.position,
                initials: initials.toUpperCase(),
            };
        });
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        return [];
    }
}

export async function deleteTeamMember(userId: number): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user) {
            return { success: false, error: 'Usuário não encontrado.' };
        }

        if (user.role === 'ADMIN') {
            return { success: false, error: 'Não é possível excluir um Administrador principal.' };
        }

        // --- SOFT DELETE ---
        await prisma.user.update({
            where: { id: userId },
            data: { active: false },
        });

        // Removemos o vínculo com os hospitais para que ele perca qualquer acesso residual
        await prisma.hospitalUser.deleteMany({
            where: { user_id: userId },
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        return { success: false, error: 'Falha ao excluir usuário.' };
    }
}

// ============================================
// 8. Designação de Equipes aos Hospitais
// ============================================

export type HospitalData = {
    id: number;
    name: string;
    address: string;
    totalBeds: number;
    occupiedBeds: number;
    vacantBeds: number;
};

export type HospitalStaffMember = {
    id: number;
    name: string;
    role: string;
    email: string;
};

export async function getHospitals(): Promise<HospitalData[]> {
    try {
        const hospitals = await prisma.hospital.findMany({
            where: { active: true },
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

export async function getHospitalStaff(hospitalId: number): Promise<HospitalStaffMember[]> {
    try {
        const staff = await prisma.hospitalUser.findMany({
            where: { hospital_id: hospitalId },
            include: {
                user: { select: { id: true, name: true, role: true, email: true } },
            },
        });
        return staff.map(s => ({
            id: s.user.id,
            name: s.user.name,
            role: s.user.role,
            email: s.user.email,
        }));
    } catch (error) {
        console.error('Erro ao buscar equipe do hospital:', error);
        return [];
    }
}

export async function assignStaffToHospital(email: string, hospitalId: number): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: false, error: 'Usuário com este e-mail não encontrado.' };
        }

        // Verifica se já está vinculado
        const existing = await prisma.hospitalUser.findUnique({
            where: {
                hospital_id_user_id: {
                    hospital_id: hospitalId,
                    user_id: user.id,
                },
            },
        });

        if (existing) {
            return { success: false, error: 'Usuário já está vinculado a este hospital.' };
        }

        await prisma.hospitalUser.create({
            data: {
                hospital_id: hospitalId,
                user_id: user.id,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao vincular equipe:', error);
        return { success: false, error: 'Falha ao vincular usuário.' };
    }
}

export async function removeStaffFromHospital(userId: number, hospitalId: number): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.hospitalUser.delete({
            where: {
                hospital_id_user_id: {
                    hospital_id: hospitalId,
                    user_id: userId,
                },
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Erro ao remover equipe:', error);
        return { success: false, error: 'Falha ao remover usuário do hospital.' };
    }
}
