'use client';

import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';

interface FormNavigationProps {
    step: number;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
}

export function FormNavigation({ step, onNext, onPrev, onSubmit }: FormNavigationProps) {
    return (
        <CardFooter className="flex justify-between">
            {step > 1 && (
                <Button onClick={onPrev} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
            )}
            {step < 3 ? (
                <Button onClick={onNext} className="ml-auto">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button type="submit" onClick={onSubmit} className="ml-auto">
                    <Upload className="mr-2 h-4 w-4" /> Create Project
                </Button>
            )}
        </CardFooter>
    );
}
