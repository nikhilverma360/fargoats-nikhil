'use client';

import { useState } from 'react';
import { ProjectBasicInfo } from './project-basic-info';
import { ProjectLogo } from './project-logo';
import { ProjectContracts } from './project-contracts';
import { FormNavigation } from './form-navigation';
import { ProjectFormProvider, useProjectForm } from '../../../hooks/genesis-form-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function RequestForProposalForm() {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <ProjectFormProvider>
            <Card className="w-full max-w-3xl mx-auto"> 
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                    <CardDescription>Fill in the details to create a new project on the GOAT network.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={(step / 3) * 100} className="mb-4" />
                    <form>
                        {step === 1 && <ProjectBasicInfo />}
                        {step === 2 && <ProjectLogo />}
                        {step === 3 && <ProjectContracts />}
                    </form>
                </CardContent>
                <FormNavigation step={step} onNext={nextStep} onPrev={prevStep} onSubmit={() => {}} />
            </Card>
        </ProjectFormProvider>
    );
}
