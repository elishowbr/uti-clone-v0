'use client';

import React, { useEffect, useState } from 'react';
import DoctorSidebar from './components/DoctorSidebar';
import DoctorTopBar from './components/DoctorTopBar';
import { getDoctorProfileForPanel, type DoctorProfile } from '../actions/doctorData';

export default function MedicoLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [profile, setProfile] = useState<DoctorProfile | null>(null);

    useEffect(() => {
        getDoctorProfileForPanel().then(setProfile);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <DoctorSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <DoctorTopBar
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                    profile={profile}
                />
                <main className="flex-1 p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
