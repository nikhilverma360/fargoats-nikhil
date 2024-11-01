import { QuestFormState, QuestStep, UserType } from '@/types/quest';

export const validateQuestForm = (state: QuestFormState, step: QuestStep, userType: UserType): Record<string, string> => {
    const errors: Record<string, string> = {};

    switch (step) {
        case QuestStep.TYPE_SELECTION:
            if (!state.type) errors.type = 'Quest type is required';
            if (!state.category) errors.category = 'Category is required';
            break;

        case QuestStep.DETAILS:
            if (!state.name) errors.name = 'Name is required';
            if (state.name.length < 3) errors.name = 'Name must be at least 3 characters';
            if (state.name.length > 50) errors.name = 'Name must be less than 50 characters';

            if (!state.description) errors.description = 'Description is required';
            if (state.description.length < 10) errors.description = 'Description must be at least 10 characters';

            if (!state.points) errors.points = 'Points allocation is required';
            if (parseInt(state.points) < 1) errors.points = 'Points must be greater than 0';

            if (!state.website) errors.website = 'Website URL is required';
            if (!state.website.startsWith('http')) errors.website = 'Website must be a valid URL';

            if (!state.duration) errors.duration = 'Duration is required';
            if (!state.requiredMetric) errors.requiredMetric = 'Required metric is required';
            break;

        case QuestStep.CONTRACT:
            if (userType === 'founder') {
                if (state.contracts.length === 0) errors.contracts = 'At least one contract is required';
                if (!state.functionAbi) errors.functionAbi = 'Function ABI is required';
            } else {
                if (!state.contractAddress) errors.contractAddress = 'Contract address is required';
                if (!state.functionAbi) errors.functionAbi = 'Function ABI is required';
            }
            break;
    }

    return errors;
};
