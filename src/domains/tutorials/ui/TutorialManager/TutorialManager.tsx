import { useTutorialContext } from '@domains/tutorials/context/TutorialContext';
import TutorialStepPopup from '@domains/tutorials/ui/TutorialStepPopup/TutorialStepPopup';

/**
 * Main tutorial manager component that renders the active tutorial
 * Should be placed at the root of the application
 */
function TutorialManager() {
  const { activeTutorial, currentStepIndex, elementRefs, nextStep, stopTutorial } = useTutorialContext();

  if (!activeTutorial) {
    return null;
  }

  const currentStep = activeTutorial.steps[currentStepIndex];

  if (!currentStep) {
    return null;
  }

  return (
    <TutorialStepPopup
      step={currentStep}
      currentStepNumber={currentStepIndex + 1}
      totalSteps={activeTutorial.steps.length}
      elementRefs={elementRefs}
      onNext={nextStep}
      onEnd={stopTutorial}
    />
  );
}

export default TutorialManager;

