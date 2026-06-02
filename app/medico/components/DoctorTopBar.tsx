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

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">

                <UserProfileDropdown
                    profile={profile ? toUserProfileData(profile) : null}
                />
            </div>
        </header>
    );
}
