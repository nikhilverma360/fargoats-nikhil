export enum QuestStep {
    TYPE_SELECTION = 'TYPE_SELECTION',
    DETAILS = 'DETAILS',
    CONTRACT = 'CONTRACT',
    REVIEW = 'REVIEW',
}

export enum QuestType {
    TVL = 'TVL',
    TRX = 'TRX',
    DAU = 'DAU',
}

export enum QuestCategory {
    HODL = 'Hodl',
    PUMP = 'Pump',
    BTC = 'BTC',
    TO_THE_MOON = 'To The Moon',
    SEND_IT = 'Send It',
}



export type UserType = 'founder' | 'community';

export interface QuestFormState {
    type: QuestType | '';
    category: QuestCategory | '';
    name: string;
    description: string;
    points: string;
    website: string;
    duration: string;
    requiredMetric: string;
    image: File | null;
    imagePreview: string;
    contracts: string[];
    functionAbi: string;
    contractAddress?: string;
    currentStep: QuestStep;
    userType: UserType;
}

export interface QuestFormContextType {
    formState: QuestFormState;
    updateField: <K extends keyof QuestFormState>(key: K, value: QuestFormState[K]) => void;
    setStep: (step: QuestStep) => void;
    handleImageUpload: (file: File) => void;
    removeImage: () => void;
    resetForm: () => void;
    submitForm: () => Promise<void>;
    isValid: (step: QuestStep) => boolean;
    errors: Record<string, string>;
}
