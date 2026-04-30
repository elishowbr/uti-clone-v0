"use client";

import React from "react";
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
} from "lucide-react";
import { MOCK_DOCTOR } from "../lib/mockData";

type NavItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    comingSoon?: boolean;
};

const PRIMARY_ITEMS: NavItem[] = [
    { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/admin/patients", label: "Pacientes", icon: Users, comingSoon: true },
    { href: "/admin/beds", label: "Mapa de Leitos", icon: Bed, comingSoon: true },
    {
        href: "/admin/evolutions",
        label: "Evoluções",
        icon: Stethoscope,
        comingSoon: true,
    },
    {
        href: "/admin/prescriptions",
        label: "Prescrições",
        icon: Pill,
        comingSoon: true,
    },
    { href: "/admin/exams", label: "Exames", icon: TestTube, comingSoon: true },
];

const SECONDARY_ITEMS: NavItem[] = [
    { href: "/admin/schedule", label: "Escala Médica", icon: CalendarDays, comingSoon: true },
    { href: "/admin/notes", label: "Notas Clínicas", icon: FileText, comingSoon: true },
    { href: "/admin/reports", label: "Relatórios", icon: ClipboardList, comingSoon: true },
    { href: "/admin/settings", label: "Configurações", icon: Settings, comingSoon: true },
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
                                Painel do médico
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
                        title="Operação clínica"
                        items={PRIMARY_ITEMS}
                        pathname={pathname}
                        onClose={onClose}
                    />
                    <NavGroup
                        title="Gestão"
                        items={SECONDARY_ITEMS}
                        pathname={pathname}
                        onClose={onClose}
                    />
                </nav>

                <div className="px-4 py-4 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {MOCK_DOCTOR.initials}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">
                                {MOCK_DOCTOR.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                                {MOCK_DOCTOR.crm}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
