import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed de demonstração com os 4 perfis de acesso do UTI Care.
 *
 * Cada usuário é criado com uma categoria (role) diferente para
 * testar o RBAC completo do sistema:
 *   - ADMIN   → painel administrativo (/admin)
 *   - DOCTOR  → painel clínico do médico (/admin)
 *   - NURSE   → gestão de leitos (/dashboard)
 *   - MANAGER → painel do gestor (/admin)
 */
async function main() {
    const passwordHash = await bcrypt.hash('123456', 10);

    // Administrador do sistema
    const admin = await prisma.user.upsert({
        where: { email: 'admin@hospital.com.br' },
        update: { role: 'ADMIN' },
        create: {
            email: 'admin@hospital.com.br',
            name: 'Ana Lima',
            password: passwordHash,
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin:', admin.email, `(${admin.role})`);

    // Médica Intensivista
    const doctor = await prisma.user.upsert({
        where: { email: 'medica@hospital.com.br' },
        update: { role: 'DOCTOR' },
        create: {
            email: 'medica@hospital.com.br',
            name: 'Dra. Maria Santos',
            password: passwordHash,
            role: 'DOCTOR',
        },
    });
    console.log('✅ Doctor:', doctor.email, `(${doctor.role})`);

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

    console.log('\n🎉 Seed completo! 4 usuários de demonstração criados.');
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
