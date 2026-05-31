import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
    connectionString: "postgresql://postgres.bzscekbajvnhnwfpobxy:ChocolateQuente2026@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed de demonstração com os perfis de acesso ativos do UTI Care.
 *
 * Cada usuário é criado com uma categoria (role) diferente para
 * testar o RBAC completo do sistema.
 */
async function main() {
    const passwordHash = await bcrypt.hash('123456', 10);

    // ──────────────────────────────────────────────
    // USUÁRIOS
    // ──────────────────────────────────────────────

    // Médica Intensivista
    const doctorUser = await prisma.user.upsert({
        where: { email: 'medica@hospital.com.br' },
        update: { role: 'DOCTOR' },
        create: {
            email: 'medica@hospital.com.br',
            name: 'Dra. Maria Santos',
            password: passwordHash,
            role: 'DOCTOR',
        },
    });
    console.log('✅ Doctor:', doctorUser.email, `(${doctorUser.role})`);

    // Enfermeiro UTI
    const nurse = await prisma.user.upsert({
        where: { email: 'enfermeiro@hospital.com.br' },
        update: { role: 'NURSE' },
        create: {
            email: 'enfermeiro@hospital.com.br',
            name: 'Enf. Lucas Oliveira',
            password: passwordHash,
            role: 'NURSE',
        },
    });
    console.log('✅ Nurse:', nurse.email, `(${nurse.role})`);

    // Gestor Hospitalar
    const manager = await prisma.user.upsert({
        where: { email: 'gestor@hospital.com.br' },
        update: { role: 'MANAGER' },
        create: {
            email: 'gestor@hospital.com.br',
            name: 'Dr. Ricardo Farias',
            password: passwordHash,
            role: 'MANAGER',
        },
    });
    console.log('✅ Manager:', manager.email, `(${manager.role})`);

    // ──────────────────────────────────────────────
    // DOCTOR (Perfil clínico vinculado ao User médico)
    // ──────────────────────────────────────────────

    // Alinha a sequência de ID do PostgreSQL para evitar conflitos de autoincremento
    try {
        await prisma.$executeRawUnsafe(`
            SELECT setval(pg_get_serial_sequence('doctors', 'id'), COALESCE(max(id), 0) + 1, false) FROM doctors;
        `);
    } catch (err) {
        console.log('⚠️ Erro ao alinhar a sequência da tabela doctors (pode ser ignorado se a tabela estiver limpa):', err);
    }

    const existingDoctor = await prisma.doctor.findFirst({
        where: { user_id: String(doctorUser.id) },
    });

    let doctor;
    if (existingDoctor) {
        doctor = await prisma.doctor.update({
            where: { id: existingDoctor.id },
            data: {
                name: 'Dra. Maria Santos',
                crm: 'CRM-SP 142.387',
                position: 'Médica Intensivista',
            },
        });
    } else {
        doctor = await prisma.doctor.create({
            data: {
                user_id: String(doctorUser.id),
                name: 'Dra. Maria Santos',
                crm: 'CRM-SP 142.387',
                position: 'Médica Intensivista',
            },
        });
    }
    console.log('✅ Doctor profile:', doctor.name, `(ID: ${doctor.id}, user_id: ${doctor.user_id})`);

    // ──────────────────────────────────────────────
    // LEITOS INICIAIS (5 leitos para demonstração)
    // ──────────────────────────────────────────────

    const bedData = [
        { bed_number: 1, label: 'Leito 01', type: 'UTI Geral' },
        { bed_number: 2, label: 'Leito 02', type: 'UTI Geral' },
        { bed_number: 3, label: 'Leito 03', type: 'UTI Geral' },
        { bed_number: 4, label: 'Leito 04', type: 'UTI Geral' },
        { bed_number: 5, label: 'Leito 05', type: 'UTI Geral' },
    ];

    for (const bed of bedData) {
        const created = await prisma.bed.upsert({
            where: { bed_number: bed.bed_number },
            update: { label: bed.label, type: bed.type },
            create: {
                bed_number: bed.bed_number,
                label: bed.label,
                type: bed.type,
                status: 'VACANT',
            },
        });
        console.log(`✅ Bed: ${created.label} (status: ${created.status})`);
    }

    console.log('\n🎉 Seed completo!');
    console.log('   3 usuários de demonstração criados');
    console.log('   1 perfil de médico vinculado');
    console.log('   5 leitos iniciais criados');
    console.log('   Senha padrão: 123456');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
