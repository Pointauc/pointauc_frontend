import { createContext, ReactNode, RefObject, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { Tutorial, TutorialContextState } from '@domains/tutorials/models/tutorial.model';
import { isTutorialCompleted, markTutorialCompleted as markCompleted } from '@domains/tutorials/services/tutorialStorage';

const TutorialContext = createContext<TutorialContextState | null>(null);

interface TutorialProviderProps {
  children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const elementRefsMap = useRef<Map<string, RefObject<HTMLElement>>>(new Map());
  const pendingActionRef = useRef<string | null>(null);

  const startTutorial = useCallback((tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setCurrentStepIndex(0);
    tutorial.onStart?.();
  }, []);

  const stopTutorial = useCallback(() => {
    if (activeTutorial) {
      const currentStep = activeTutorial.steps[currentStepIndex];
      currentStep?.onExit?.();
      activeTutorial.onCancel?.();
      setActiveTutorial(null);
      setCurrentStepIndex(0);
      pendingActionRef.current = null;
    }
  }, [activeTutorial, currentStepIndex]);

  const nextStep = useCallback(() => {
    if (!activeTutorial) return;

    const currentStep = activeTutorial.steps[currentStepIndex];
    currentStep?.onExit?.();

    if (currentStepIndex < activeTutorial.steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      activeTutorial.steps[newIndex]?.onEnter?.();
      pendingActionRef.current = null;
    } else {
      // Tutorial completed
      markCompleted(activeTutorial.id);
      activeTutorial.onComplete?.();
      setActiveTutorial(null);
      setCurrentStepIndex(0);
      pendingActionRef.current = null;
    }
  }, [activeTutorial, currentStepIndex]);

  const previousStep = useCallback(() => {
    if (!activeTutorial || currentStepIndex === 0) return;

    const currentStep = activeTutorial.steps[currentStepIndex];
    currentStep?.onExit?.();

    const newIndex = currentStepIndex - 1;
    setCurrentStepIndex(newIndex);
    activeTutorial.steps[newIndex]?.onEnter?.();
    pendingActionRef.current = null;
  }, [activeTutorial, currentStepIndex]);

  const registerElement = useCallback((id: string, ref: RefObject<HTMLElement>) => {
    elementRefsMap.current.set(id, ref);
  }, []);

  const unregisterElement = useCallback((id: string) => {
    elementRefsMap.current.delete(id);
  }, []);

  const triggerAction = useCallback((actionId: string) => {
    if (!activeTutorial) return;

    const currentStep = activeTutorial.steps[currentStepIndex];
    if (currentStep?.progression.type === 'action' && currentStep.progression.action.actionId === actionId) {
      nextStep();
    }
  }, [activeTutorial, currentStepIndex, nextStep]);

  const markTutorialCompleted = useCallback((tutorialId: string) => {
    markCompleted(tutorialId);
  }, []);

  const contextValue = useMemo<TutorialContextState>(() => ({
    activeTutorial,
    currentStepIndex,
    elementRefs: elementRefsMap.current,
    startTutorial,
    stopTutorial,
    nextStep,
    previousStep,
    registerElement,
    unregisterElement,
    triggerAction,
    isTutorialCompleted,
    markTutorialCompleted,
  }), [
    activeTutorial,
    currentStepIndex,
    startTutorial,
    stopTutorial,
    nextStep,
    previousStep,
    registerElement,
    unregisterElement,
    triggerAction,
    markTutorialCompleted,
  ]);

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorialContext(): TutorialContextState {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorialContext must be used within a TutorialProvider');
  }
  return context;
}

