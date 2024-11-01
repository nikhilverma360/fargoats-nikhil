import { QuestType, QuestCategory, QuestStep } from '@/types/quest';

export const QUEST_CATEGORIES = {
    [QuestType.TVL]: [QuestCategory.HODL, QuestCategory.PUMP],
    [QuestType.TRX]: [QuestCategory.BTC, QuestCategory.TO_THE_MOON],
    [QuestType.DAU]: [QuestCategory.SEND_IT],
};

export const STEP_ORDER = [QuestStep.TYPE_SELECTION, QuestStep.DETAILS, QuestStep.CONTRACT, QuestStep.REVIEW];

export const STEP_LABELS = {
    [QuestStep.TYPE_SELECTION]: 'Quest Type',
    [QuestStep.DETAILS]: 'Details',
    [QuestStep.CONTRACT]: 'Contract',
    [QuestStep.REVIEW]: 'Review',
};
