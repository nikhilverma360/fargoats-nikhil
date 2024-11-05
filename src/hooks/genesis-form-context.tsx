'use client';

import { createContext, useContext, useState } from 'react';
import { ProjectFormContextType, ProjectFormState } from '@/types/genesis';

const ProjectFormContext = createContext<ProjectFormContextType | undefined>(undefined);

export function ProjectFormProvider({ children }: { children: React.ReactNode }) {
    const [formState, setFormState] = useState<ProjectFormState>({
        projectName: '',
        description: '',
        website: '',
        logo: null,
        abiList: [{ abi: '', contractAddress: '', contractName: '' }],
        tags: [],
    });

    const updateFormState = (updates: Partial<ProjectFormState>) => {
        setFormState((current) => ({ ...current, ...updates }));
    };

    const resetFormState = () => {
        setFormState({
            projectName: '',
            description: '',
            website: '',
            logo: null,
            abiList: [{ abi: '', contractAddress: '', contractName: '' }],
            tags: [],
        });
    };

    const submitForm = async () => {
        // TODO: Submit form to backend
    }
    return <ProjectFormContext.Provider value={{ formState, updateFormState, resetFormState, submitForm }}>{children}</ProjectFormContext.Provider>;
}

export const useProjectForm = () => {
    const context = useContext(ProjectFormContext);
    if (!context) {
        throw new Error('useProjectForm must be used within a ProjectFormProvider');
    }
    return context;
};
