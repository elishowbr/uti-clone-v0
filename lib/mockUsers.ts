/**
 * Mock staff credentials used exclusively for the prototype authentication flow.
 *
 * This module MUST be replaced by real DB-backed user lookup once the
 * `User ↔ Doctor/Nurse` domain relation is modelled in the Prisma schema.
 *
 * Security note: passwords are stored as plain strings here because this data
 * never reaches production. Do NOT replicate this pattern outside prototype code.
 */

export type StaffRole = "DOCTOR" | "NURSE";

export type MockStaffUser = {
    id: string;
    name: string;
    email: string;
    /** Plain-text only for prototype. Replace with bcrypt hash in production. */
    password: string;
    role: StaffRole;
    /** CRM registration number – Doctors only. */
    crm?: string;
    /** COREN registration number – Nurses only. */
    coren?: string;
    specialty: string;
};

export const MOCK_STAFF_USERS: MockStaffUser[] = [
    {
        id: "mock-doc-001",
        name: "Dra. Maria Santos",
        email: "medica@hospital.com.br",
        password: "Medico@2026",
        role: "DOCTOR",
        crm: "CRM-SP 142.387",
        specialty: "Medicina Intensiva",
    },
    {
        id: "mock-nurse-001",
        name: "Enf. Lucas Oliveira",
        email: "enfermeiro@hospital.com.br",
        password: "Enfermeiro@2026",
        role: "NURSE",
        coren: "COREN-SP 456.789",
        specialty: "UTI Adulto",
    },
];

export function findMockUserByEmail(email: string): MockStaffUser | undefined {
    return MOCK_STAFF_USERS.find(
        (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
}
