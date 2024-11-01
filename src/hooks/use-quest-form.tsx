'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { validateQuestForm } from '@/lib/validation'
import {
  QuestStep,
  QuestFormState,
  QuestFormContextType,
  UserType
} from '@/types/quest'
import { STEP_ORDER } from '@/constants/quest'

const INITIAL_STATE: QuestFormState = {
  type: '',
  category: '',
  name: '',
  description: '',
  points: '',
  website: '',
  duration: '',
  requiredMetric: '',
  image: null,
  imagePreview: '',
  contracts: [],
  functionAbi: '',
    contractAddress: '',
    currentStep: QuestStep.TYPE_SELECTION,
    userType: 'community',
};

const QuestFormContext = createContext<QuestFormContextType | undefined>(undefined)

export function QuestFormProvider({ 
  children,
  userType = 'community'
}: { 
  children: React.ReactNode
  userType: UserType
}) {
    const [formState, setFormState] = useState<QuestFormState>({ ...INITIAL_STATE, userType });
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = useCallback(<K extends keyof QuestFormState>(
    key: K,
    value: QuestFormState[K]
  ) => {
    setFormState(current => ({ ...current, [key]: value }))
    // Clear error when field is updated
    setErrors(current => ({ ...current, [key]: '' }))
  }, [])

  const setStep = useCallback((step: QuestStep) => {
    const currentStepErrors = validateQuestForm(formState, formState.currentStep, userType)
    
    if (Object.keys(currentStepErrors).length === 0) {
      updateField('currentStep', step)
      setErrors({})
    } else {
      setErrors(currentStepErrors)
    }
  }, [formState, userType, updateField])

  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(current => ({
        ...current,
        image: 'Image size must be less than 5MB'
      }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      updateField('image', file)
      updateField('imagePreview', reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [updateField])

  const removeImage = useCallback(() => {
    updateField('image', null)
    updateField('imagePreview', '')
  }, [updateField])

  const resetForm = useCallback(() => {
    setFormState(INITIAL_STATE)
    setErrors({})
  }, [])

  const isValid = useCallback((step: QuestStep): boolean => {
    const stepErrors = validateQuestForm(formState, step, userType)
    return Object.keys(stepErrors).length === 0
  }, [formState, userType])

  const submitForm = useCallback(async () => {
    try {
      // Validate all steps
      let allErrors: Record<string, string> = {}
      STEP_ORDER.forEach(step => {
        const stepErrors = validateQuestForm(formState, step, userType)
        allErrors = { ...allErrors, ...stepErrors }
      })

      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors)
        throw new Error('Please fix all errors before submitting')
      }

      const formData = new FormData()
      Object.entries(formState).forEach(([key, value]) => {
        if (key === 'contracts') {
          formData.append(key, JSON.stringify(value))
        } else if (value !== null) {
          formData.append(key, value)
        }
      })

      const response = await fetch('/api/quests', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit quest')
      }

      resetForm()
      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        setErrors(current => ({
          ...current,
          submit: error.message
        }))
      }
      throw error
    }
  }, [formState, userType, resetForm])

  return (
    <QuestFormContext.Provider 
      value={{
        formState,
        updateField,
        setStep,
        handleImageUpload,
        removeImage,
        resetForm,
        submitForm,
        isValid,
        errors
      }}
    >
      {children}
    </QuestFormContext.Provider>
  )
}

export const useQuestForm = () => {
  const context = useContext(QuestFormContext)
  if (!context) {
    throw new Error('useQuestForm must be used within a QuestFormProvider')
  }
  return context
}