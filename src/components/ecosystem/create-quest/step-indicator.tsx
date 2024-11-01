import { STEP_ORDER, STEP_LABELS } from '@/constants/quest';
import { QuestStep } from '@/types/quest';

export const StepIndicator = ({ currentStep }: { currentStep: QuestStep }) => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center">
                {STEP_ORDER.map((step, index) => (
                    <div key={step} className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index <= currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {index + 1}
                        </div>
                        {index < STEP_ORDER.length - 1 && <div className={`h-1 w-24 ${index < currentIndex ? 'bg-primary' : 'bg-muted'}`} />}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
                {STEP_ORDER.map((step) => (
                    <span key={step}>{STEP_LABELS[step]}</span>
                ))}
            </div>
        </div>
    );
};
