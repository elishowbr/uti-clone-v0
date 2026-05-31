"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    Bed,
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    Pill,
    Settings,
    Stethoscope,
    TestTube,
    Users,
    X,
    LogOut, // <-- Importação do ícone adicionada aqui
} from "lucide-react";
import { getDoctorProfile, type AdminDoctorProfile } from "../../actions/adminData";

type NavItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    comingSoon?: boolean;
};

const PRIMARY_ITEMS: NavItem[] = [
    { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/admin/patients", label: "Auditoria de Pacientes", icon: Users, comingSoon: true },
    { href: "/admin/beds", label: "Status dos Leitos", icon: Bed, comingSoon: true },
    { href: "/admin/evolutions", label: "Auditoria de Evoluções", icon: Stethoscope, comingSoon: true },
];

const SECONDARY_ITEMS: NavItem[] = [
    { href: "/admin/staff", label: "Gestão da Equipe (Staff)", icon: Users, comingSoon: true },
    { href: "/admin/indicators", label: "Indicadores de Ocupação", icon: Activity, comingSoon: true },
    { href: "/admin/reports", label: "Relatórios Hospitalares", icon: ClipboardList, comingSoon: true },
    { href: "/admin/settings", label: "Configurações Gerais", icon: Settings, comingSoon: true },
];

function isItemActive(itemHref: string, currentPath: string): boolean {
    return (
        currentPath === itemHref || currentPath.startsWith(`${itemHref}/`)
    );
}

type AdminSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

function NavGroup({
    title,
    items,
    pathname,
    onClose,
}: {
    title: string;
    items: NavItem[];
    pathname: string;
    onClose: () => void;
}) {
    return (
        <div className="space-y-1">
            <div className="px-3 pb-2 pt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {title}
            </div>
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.href, pathname);
                const isDisabled = !!item.comingSoon;

                return (
                    <Link
                        key={item.href}
                        href={isDisabled ? "#" : item.href}
                        aria-disabled={isDisabled}
                        onClick={(event) => {
                            if (isDisabled) {
                                event.preventDefault();
                                return;
                            }
                            onClose();
                        }}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        } ${isDisabled ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                        <span className="flex items-center gap-3">
                            <Icon
                                className={`w-4 h-4 ${
                                    isActive ? "text-blue-600" : "text-slate-400"
                                }`}
                            />
                            {item.label}
                        </span>
                        {isDisabled && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                Em breve
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname() ?? "";
    const [profile, setProfile] = useState<AdminDoctorProfile | null>(null);

    useEffect(() => {
        getDoctorProfile().then(setProfile);
    }, []);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } lg:transform-none`}
            >
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3"
                        onClick={onClose}
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-slate-900 leading-tight">
                                UTI Care
                            </div>
                            <div className="text-[11px] text-slate-500">
                                Gestão Estratégica
                            </div>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                        aria-label="Fechar menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-2 overflow-y-auto">
                    <NavGroup
                        title="Monitoramento"
                        items={PRIMARY_ITEMS}
                        pathname={pathname}
                        onClose={onClose}
                    />
                    <NavGroup
                        title="Administração"
                        items={SECONDARY_ITEMS}
                        pathname={pathname}
                        onClose={onClose}
                    />
                </nav>

                {/* Rodapé atualizado com o botão de Sair */}
                <div className="px-4 py-4 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {profile?.initials ?? '...'}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">
                                    {profile?.name ?? 'Carregando...'}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                    {profile?.crm ?? ''}
                                </div>
                            </div>
                        </div>
                        
                        {/* Novo botão de Logout */}
                        <Link
                            href="/logout"
                            title="Sair do sistema"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}