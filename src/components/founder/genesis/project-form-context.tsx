'use client';

import { createContext, useContext, useState } from 'react';

interface ProjectFormState {
    projectName: string;
    description: string;
    website: string;
    logo: File | null;
    abiList: Array<{ abi: string; contractAddress: string }>;
}

interface ProjectFormContextType {
    formState: ProjectFormState;
    updateFormState: (updates: Partial<ProjectFormState>) => void;
}

const ProjectFormContext = createContext<ProjectFormContextType | undefined>(undefined);

export function ProjectFormProvider({ children }: { children: React.ReactNode }) {
    const [formState, setFormState] = useState<ProjectFormState>({
        projectName: '',
        description: '',
        website: '',
        logo: null,
        abiList: [{ abi: '', contractAddress: '' }],
    });

    const updateFormState = (updates: Partial<ProjectFormState>) => {
        setFormState((current) => ({ ...current, ...updates }));
    };

    return <ProjectFormContext.Provider value={{ formState, updateFormState }}>{children}</ProjectFormContext.Provider>;
}

export const useProjectForm = () => {
    const context = useContext(ProjectFormContext);
    if (!context) {
        throw new Error('useProjectForm must be used within a ProjectFormProvider');
    }
    return context;
};
