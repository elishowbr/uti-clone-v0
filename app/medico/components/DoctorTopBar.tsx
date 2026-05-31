'use client';

import React from 'react';
import { Menu, Stethoscope } from 'lucide-react';
import UserProfileDropdown, { type UserProfileData } from '../../components/UserProfileDropdown';
import type { DoctorProfile } from '../../actions/doctorData';

type Props = {
    onToggleSidebar: () => void;
    profile: DoctorProfile | null;
};

/** Adapts DoctorProfile to the shape UserProfileDropdown expects */
function toUserProfileData(profile: DoctorProfile): UserProfileData {
    return {
        id: profile.id,
        name: profile.name,
        initials: profile.initials,
        crm: profile.crm,
        position: profile.position,
    };
}

export default function DoctorTopBar({ onToggleSidebar, profile }: Props) {
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
            {/* Mobile hamburger */}
            <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Abrir menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Greeting (desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
                <Stethoscope className="w-4 h-4 text-blue-500" />
                <span>
                    {greeting},{' '}
                    <span className="font-semibold text-slate-800">
                        {profile?.name ?? '...'}
                    </span>
                </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Plantão Ativo
                </div>
                <UserProfileDropdown
                    profile={profile ? toUserProfileData(profile) : null}
                />
            </div>
        </header>
    );
}
