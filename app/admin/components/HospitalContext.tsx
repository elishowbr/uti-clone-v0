"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    DEFAULT_HOSPITAL_ID,
    MOCK_HOSPITALS,
    type HospitalLink,
} from "../lib/mockData";

const STORAGE_KEY = "uti-care:admin-selected-hospital";

type HospitalContextValue = {
    selectedHospital: HospitalLink;
    selectHospital: (hospitalId: string) => void;
    hospitals: HospitalLink[];
};

const HospitalContext = createContext<HospitalContextValue | null>(null);

function readStoredHospitalId(): string {
    if (typeof window === "undefined") return DEFAULT_HOSPITAL_ID;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && MOCK_HOSPITALS.some((h) => h.id === stored)) return stored;
    return DEFAULT_HOSPITAL_ID;
}

export function HospitalProvider({ children }: { children: React.ReactNode }) {
    const [selectedId, setSelectedId] = useState<string>(DEFAULT_HOSPITAL_ID);

    useEffect(() => {
        setSelectedId(readStoredHospitalId());
    }, []);

    const selectHospital = useCallback((hospitalId: string) => {
        if (!MOCK_HOSPITALS.some((h) => h.id === hospitalId)) return;
        setSelectedId(hospitalId);
        try {
            window.localStorage.setItem(STORAGE_KEY, hospitalId);
        } catch {
            // Ignora falhas de persistência (modo privado, storage cheio etc.).
        }
    }, []);

    const selectedHospital =
        MOCK_HOSPITALS.find((h) => h.id === selectedId) ?? MOCK_HOSPITALS[0];

    return (
        <HospitalContext.Provider
            value={{
                selectedHospital,
                selectHospital,
                hospitals: MOCK_HOSPITALS,
            }}
        >
            {children}
        </HospitalContext.Provider>
    );
}

export function useHospital(): HospitalContextValue {
    const ctx = useContext(HospitalContext);
    if (!ctx) {
        throw new Error("useHospital deve ser usado dentro de HospitalProvider");
    }
    return ctx;
}
