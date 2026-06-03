import React from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { getTeamMembers } from '@/app/actions/adminData';
import StaffTable from './components/StaffTable';

export const dynamic = 'force-dynamic';

export default async function FuncionariosPage() {
    const staff = await getTeamMembers();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quadro de Funcionários</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerencie todos os profissionais cadastrados no sistema (Médicos, Enfermeiros, etc).
                    </p>
                </div>
                <Link
                    href="/admin/funcionarios/registrar"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Novo Cadastro
                </Link>
            </div>

            <StaffTable initialData={staff} />
        </div>
    );
}
