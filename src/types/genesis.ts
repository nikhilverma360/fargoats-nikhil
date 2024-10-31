interface ProjectFormState {
    projectName: string;
    description: string;
    website: string;
    logo: File | null;
    abiList: Array<{ abi: string; contractAddress: string; contractName: string }>;
    tags: string[];
}

interface ProjectFormContextType {
    formState: ProjectFormState;
    updateFormState: (updates: Partial<ProjectFormState>) => void;
    resetFormState: () => void;
    submitForm: () => Promise<void>;
}

export type { ProjectFormState, ProjectFormContextType };
