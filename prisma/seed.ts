import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
    connectionString: "postgresql://postgres.bzscekbajvnhnwfpobxy:ChocolateQuente2026@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const passwordHash = await bcrypt.hash('Maluco123', 10);

    // ── Médica ────────────────────────────────────────────────
    const doctorUser = await prisma.user.upsert({
        where:  { email: 'medica@hospital.com.br' },
        update: { role: 'DOCTOR', password: passwordHash },
        create: {
            email:    'medica@hospital.com.br',
            name:     'Dra. Maria Santos',
            password: passwordHash,
            role:     'DOCTOR',
        },
    });
    console.log('✅ Doctor user:', doctorUser.email);

    // ── Enfermeira ────────────────────────────────────────────
    const nurse = await prisma.user.upsert({
        where:  { email: 'enfermeira@hospital.com.br' },
        update: { role: 'NURSE', password: passwordHash },
        create: {
            email:    'enfermeira@hospital.com.br',
            name:     'Enf. Ana Oliveira',
            password: passwordHash,
            role:     'NURSE',
        },
    });
    console.log('✅ Nurse user:', nurse.email);

    // ── Gestor ────────────────────────────────────────────────
    const manager = await prisma.user.upsert({
        where:  { email: 'gestor@hospital.com.br' },
        update: { role: 'MANAGER', password: passwordHash },
        create: {
            email:    'gestor@hospital.com.br',
            name:     'Ricardo Farias',
            password: passwordHash,
            role:     'MANAGER',
        },
    });
    console.log('✅ Manager user:', manager.email);

    // ── Perfil clínico do médico ──────────────────────────────
    try {
        await prisma.$executeRawUnsafe(`
            SELECT setval(pg_get_serial_sequence('doctors', 'id'), COALESCE(max(id), 0) + 1, false)
            FROM doctors;
        `);
    } catch { /* ignore if table is empty */ }

    const existingDoctor = await prisma.doctor.findFirst({
        where: { user_id: String(doctorUser.id) },
    });

    const doctor = existingDoctor
        ? await prisma.doctor.update({
              where: { id: existingDoctor.id },
              data:  { name: 'Dra. Maria Santos', crm: 'CRM-SP 142.387', position: 'Médica Intensivista' },
          })
        : await prisma.doctor.create({
              data: {
                  user_id:  String(doctorUser.id),
                  name:     'Dra. Maria Santos',
                  crm:      'CRM-SP 142.387',
                  position: 'Médica Intensivista',
              },
          });

    console.log('✅ Doctor profile:', doctor.name, `(user_id: ${doctor.user_id})`);

    console.log('\n🎉 Seed completo!');
    console.log('   medica@hospital.com.br     → DOCTOR  (Maluco123)');
    console.log('   enfermeira@hospital.com.br → NURSE   (Maluco123)');
    console.log('   gestor@hospital.com.br     → MANAGER (Maluco123)');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
