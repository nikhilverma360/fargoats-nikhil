'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { STEP_ORDER } from "@/constants/quest";
import { QuestFormProvider, useQuestForm } from "@/hooks/use-quest-form";
import { QuestStep, UserType } from "@/types/quest";
import { StepIndicator } from "./step-indicator";
import { Button } from "@/components/ui/button";
import { QuestTypeStep } from "./quest-type";
import { QuestDetailsStep } from "./quest-details";
import { ContractStep } from "./contract-select";
import { ReviewStep } from "./review-step";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function QuestCreator({ userType = 'founder' }: { userType: UserType }) {
    return (
        <QuestFormProvider userType={userType}>
            <QuestCreatorContent />
        </QuestFormProvider>
    )
}

function QuestCreatorContent() {
    const { formState, setStep, submitForm, isValid, errors } = useQuestForm();

    const currentStepIndex = STEP_ORDER.indexOf(formState.currentStep);

    const handleNext = async () => {
        if (formState.currentStep === QuestStep.REVIEW) {
            await submitForm();
        } else {
            const nextStep = STEP_ORDER[currentStepIndex + 1];
            setStep(nextStep);
        }
    };

    const handlePrevious = () => {
        const previousStep = STEP_ORDER[currentStepIndex - 1];
        setStep(previousStep);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Create {formState.userType === 'founder' ? 'Founder' : 'Community'} Quest</CardTitle>
            </CardHeader>
            <CardContent>
                <StepIndicator currentStep={formState.currentStep} />
                {errors.submit && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                )}
                {/* Render step content based on currentStep */}
                {formState.currentStep === QuestStep.TYPE_SELECTION && <QuestTypeStep />}
                {formState.currentStep === QuestStep.DETAILS && <QuestDetailsStep />}
                {formState.currentStep === QuestStep.CONTRACT && <ContractStep userType={formState.userType} />}
                {formState.currentStep === QuestStep.REVIEW && <ReviewStep userType={formState.userType} />}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStepIndex === 0}>
                    Previous
                </Button>
                <Button onClick={handleNext} disabled={!isValid(formState.currentStep)}>
                    {formState.currentStep === QuestStep.REVIEW ? 'Submit' : 'Next'}
                </Button>
            </CardFooter>
        </Card>
    );
}
