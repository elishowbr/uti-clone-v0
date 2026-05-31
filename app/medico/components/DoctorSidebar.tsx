'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    Bed,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Stethoscope,
    Users,
    X,
} from 'lucide-react';
import { getDoctorProfileForPanel, type DoctorProfile } from '../../actions/doctorData';

type NavItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
    { href: '/medico', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/medico/patients', label: 'Meus Pacientes', icon: Users },
    { href: '/medico/evolutions', label: 'Histórico de Evoluções', icon: ClipboardList },
];

const QUICK_LINKS: NavItem[] = [
    { href: '/dashboard', label: 'Ir para UTI (Leitos)', icon: Bed },
];

function isActive(itemHref: string, pathname: string): boolean {
    if (itemHref === '/medico') return pathname === '/medico';
    return pathname.startsWith(itemHref);
}

type Props = { isOpen: boolean; onClose: () => void };

export default function DoctorSidebar({ isOpen, onClose }: Props) {
    const pathname = usePathname() ?? '';
    const [profile, setProfile] = useState<DoctorProfile | null>(null);

    useEffect(() => {
        getDoctorProfileForPanel().then(setProfile);
    }, []);

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col
                transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:transform-none`}
            >
                {/* Logo */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <Link href="/medico" className="flex items-center gap-3" onClick={onClose}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-slate-900 leading-tight">UTI Care</div>
                            <div className="text-[11px] text-slate-500">Painel do Médico</div>
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

                {/* Nav principal */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
                    {/* Clínico */}
                    <div className="space-y-1">
                        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Clínico
                        </div>
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href, pathname);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`}
                                    />
                                    {item.label}
                                    {active && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Acesso rápido */}
                    <div className="space-y-1">
                        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Acesso Rápido
                        </div>
                        {QUICK_LINKS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                                >
                                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer com perfil + logout */}
                <div className="px-4 py-4 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                                {profile?.initials ?? '??'}
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
                        <Link
                            href="/logout"
                            title="Sair do sistema"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
