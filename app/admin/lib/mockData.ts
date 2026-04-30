/**
 * Dados mockados do painel administrativo.
 *
 * Esta camada existe para permitir um protótipo navegável da experiência do
 * "Médico Administrador" sem depender do banco. O schema Prisma atual não
 * modela vínculo entre `User` e `Doctor` nem a entidade `Hospital`.
 * Substituir por server actions reais assim que o domínio estiver pronto.
 */

export type HospitalLink = {
    id: string;
    name: string;
    shortName: string;
    city: string;
    state: string;
    role: string;
    shifts: string;
    bedsTotal: number;
    bedsOccupied: number;
    isPrimary?: boolean;
};

export type DoctorProfile = {
    id: string;
    name: string;
    initials: string;
    crm: string;
    specialty: string;
    position: string;
    email: string;
    onCallUntil: string;
};

export type PatientStatus = "CRITICAL" | "STABLE" | "IMPROVING" | "OBSERVATION";

export type DailyPatient = {
    id: string;
    name: string;
    age: number;
    bedLabel: string;
    hospitalId: string;
    status: PatientStatus;
    diagnosis: string;
    admissionDate: string;
    lastEvolutionAt: string;
    hasPendingEvolution: boolean;
    alerts: string[];
};

export type ActivityKind =
    | "EVOLUTION"
    | "PRESCRIPTION"
    | "EXAM"
    | "ADMISSION"
    | "ALERT";

export type ActivityEntry = {
    id: string;
    kind: ActivityKind;
    title: string;
    description: string;
    hospitalId: string;
    occurredAt: string;
};

export const MOCK_DOCTOR: DoctorProfile = {
    id: "doc-1",
    name: "Dra. Maria Santos",
    initials: "MS",
    crm: "CRM-SP 142.387",
    specialty: "Medicina Intensiva",
    position: "Coordenadora de UTI",
    email: "maria.santos@hospital.com.br",
    onCallUntil: "20:00",
};

export const MOCK_HOSPITALS: HospitalLink[] = [
    {
        id: "hsp-central",
        name: "Hospital Central de Cuidados Intensivos",
        shortName: "HC Central",
        city: "São Paulo",
        state: "SP",
        role: "Coordenadora UTI",
        shifts: "Seg, Qua, Sex · 08h-20h",
        bedsTotal: 24,
        bedsOccupied: 19,
        isPrimary: true,
    },
    {
        id: "hsp-sul",
        name: "Hospital Regional Sul",
        shortName: "HR Sul",
        city: "Curitiba",
        state: "PR",
        role: "Plantonista UTI",
        shifts: "Ter, Qui · 19h-07h",
        bedsTotal: 16,
        bedsOccupied: 11,
    },
    {
        id: "hsp-norte",
        name: "Hospital Universitário Norte",
        shortName: "HU Norte",
        city: "Manaus",
        state: "AM",
        role: "Diarista",
        shifts: "Sáb · 08h-18h",
        bedsTotal: 12,
        bedsOccupied: 7,
    },
];

export const DEFAULT_HOSPITAL_ID = MOCK_HOSPITALS[0].id;

export const MOCK_PATIENTS: DailyPatient[] = [
    {
        id: "pat-101",
        name: "João da Silva",
        age: 67,
        bedLabel: "Leito 03",
        hospitalId: "hsp-central",
        status: "CRITICAL",
        diagnosis: "Choque séptico · pneumonia comunitária",
        admissionDate: "2026-04-26",
        lastEvolutionAt: "2026-04-30T07:50:00",
        hasPendingEvolution: true,
        alerts: ["PAM 58 mmHg", "Lactato 4.1"],
    },
    {
        id: "pat-102",
        name: "Maria Aparecida Lima",
        age: 54,
        bedLabel: "Leito 07",
        hospitalId: "hsp-central",
        status: "STABLE",
        diagnosis: "Pós-operatório · cirurgia cardíaca",
        admissionDate: "2026-04-28",
        lastEvolutionAt: "2026-04-30T11:20:00",
        hasPendingEvolution: false,
        alerts: [],
    },
    {
        id: "pat-103",
        name: "Carlos Mendes",
        age: 72,
        bedLabel: "Leito 11",
        hospitalId: "hsp-central",
        status: "IMPROVING",
        diagnosis: "AVC isquêmico · trombolisado",
        admissionDate: "2026-04-23",
        lastEvolutionAt: "2026-04-30T09:10:00",
        hasPendingEvolution: false,
        alerts: ["Avaliar desmame VM"],
    },
    {
        id: "pat-104",
        name: "Helena Rodrigues",
        age: 39,
        bedLabel: "Leito 14",
        hospitalId: "hsp-central",
        status: "OBSERVATION",
        diagnosis: "Cetoacidose diabética compensada",
        admissionDate: "2026-04-29",
        lastEvolutionAt: "2026-04-30T08:00:00",
        hasPendingEvolution: true,
        alerts: ["Glicemia capilar 2/2h"],
    },
    {
        id: "pat-105",
        name: "Roberto Souza",
        age: 61,
        bedLabel: "Leito 02",
        hospitalId: "hsp-sul",
        status: "CRITICAL",
        diagnosis: "Insuficiência respiratória · SDRA",
        admissionDate: "2026-04-25",
        lastEvolutionAt: "2026-04-30T06:40:00",
        hasPendingEvolution: true,
        alerts: ["SpO2 88%", "PEEP elevada"],
    },
    {
        id: "pat-106",
        name: "Antônia Pereira",
        age: 81,
        bedLabel: "Leito 05",
        hospitalId: "hsp-sul",
        status: "STABLE",
        diagnosis: "ICC descompensada",
        admissionDate: "2026-04-27",
        lastEvolutionAt: "2026-04-30T10:30:00",
        hasPendingEvolution: false,
        alerts: [],
    },
    {
        id: "pat-107",
        name: "Felipe Araújo",
        age: 28,
        bedLabel: "Leito 04",
        hospitalId: "hsp-norte",
        status: "IMPROVING",
        diagnosis: "Trauma craniano · pós-operatório",
        admissionDate: "2026-04-24",
        lastEvolutionAt: "2026-04-30T08:45:00",
        hasPendingEvolution: false,
        alerts: ["Reavaliar Glasgow"],
    },
];

export const MOCK_ACTIVITIES: ActivityEntry[] = [
    {
        id: "act-1",
        kind: "EVOLUTION",
        title: "Evolução registrada",
        description: "Paciente João da Silva (Leito 03) — evolução das 07:50.",
        hospitalId: "hsp-central",
        occurredAt: "2026-04-30T07:55:00",
    },
    {
        id: "act-2",
        kind: "EXAM",
        title: "Resultado de hemograma disponível",
        description: "Paciente Carlos Mendes (Leito 11) — alterações leves em leucócitos.",
        hospitalId: "hsp-central",
        occurredAt: "2026-04-30T09:30:00",
    },
    {
        id: "act-3",
        kind: "PRESCRIPTION",
        title: "Prescrição renovada",
        description: "Helena Rodrigues — insulina regular contínua mantida por 24h.",
        hospitalId: "hsp-central",
        occurredAt: "2026-04-30T08:10:00",
    },
    {
        id: "act-4",
        kind: "ADMISSION",
        title: "Nova admissão",
        description: "Leito 14 ocupado — paciente Helena Rodrigues, 39 anos.",
        hospitalId: "hsp-central",
        occurredAt: "2026-04-29T22:18:00",
    },
    {
        id: "act-5",
        kind: "ALERT",
        title: "Alerta hemodinâmico",
        description: "Roberto Souza — PAM 58 mmHg sustentada por 10 min.",
        hospitalId: "hsp-sul",
        occurredAt: "2026-04-30T06:32:00",
    },
];

export function getPatientsByHospital(hospitalId: string): DailyPatient[] {
    return MOCK_PATIENTS.filter((p) => p.hospitalId === hospitalId);
}

export function getActivitiesByHospital(hospitalId: string): ActivityEntry[] {
    return MOCK_ACTIVITIES.filter((a) => a.hospitalId === hospitalId);
}
