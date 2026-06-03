"use client";

import React, { useState } from "react";
import { Search, Trash2, Loader2 } from "lucide-react";
import { deleteTeamMember, type TeamMember } from "@/app/actions/adminData";
import { useRouter } from "next/navigation";

const ROLE_LABEL: Record<string, string> = { DOCTOR: "Médico", NURSE: "Enfermeiro", MANAGER: "Gestor", ADMIN: "Admin" };
const ROLE_COLORS: Record<string, string> = {
    DOCTOR: "bg-blue-100 text-blue-700",
    NURSE: "bg-emerald-100 text-emerald-700",
    MANAGER: "bg-indigo-100 text-indigo-700",
    ADMIN: "bg-amber-100 text-amber-700",
};

export default function StaffTable({ initialData }: { initialData: TeamMember[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const filteredData = initialData.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ROLE_LABEL[d.role] || d.role).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o funcionário ${name}? Essa ação não pode ser desfeita.`)) return;
        setIsDeleting(id);
        const res = await deleteTeamMember(id);
        setIsDeleting(null);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error ?? "Erro ao excluir o funcionário.");
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar funcionário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    {filteredData.length} registro(s)
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Profissional</th>
                            <th className="px-6 py-4 font-semibold">Função/Cargo</th>
                            <th className="px-6 py-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map((member) => (
                            <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-sm">
                                            {member.initials}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{member.name}</div>
                                            <div className="text-slate-500 text-xs">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-700"}`}>
                                        {ROLE_LABEL[member.role] ?? member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(member.id, member.name)}
                                        disabled={isDeleting === member.id}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Excluir cadastro"
                                    >
                                        {isDeleting === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                    Nenhum funcionário encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
