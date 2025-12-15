import { Button, Paper, Text } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TutorialStep } from '@domains/tutorials/models/tutorial.model';
import { calculatePopupPosition, CalculatedPosition } from '@domains/tutorials/utils/positionCalculator';
import { actionDetectionManager } from '@domains/tutorials/utils/actionDetection';
import ProgressIndicator from '@domains/tutorials/ui/ProgressIndicator/ProgressIndicator';
import ElementHighlighter from '@domains/tutorials/ui/ElementHighlighter/ElementHighlighter';
import SpotlightOverlay from '@domains/tutorials/ui/SpotlightOverlay/SpotlightOverlay';

import styles from './TutorialStepPopup.module.css';

interface TutorialStepPopupProps {
  step: TutorialStep;
  currentStepNumber: number;
  totalSteps: number;
  elementRefs: Map<string, React.RefObject<HTMLElement>>;
  onNext: () => void;
  onEnd: () => void;
}

function TutorialStepPopup({
  step,
  currentStepNumber,
  totalSteps,
  elementRefs,
  onNext,
  onEnd,
}: TutorialStepPopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CalculatedPosition>({});
  const [popupSize, setPopupSize] = useState({ width: 320, height: 200 });

  const targetElementRef = step.targetElementId ? elementRefs.get(step.targetElementId) : undefined;
  const highlightStyle = step.highlightStyle || { type: 'none' };

  // Update popup position
  useEffect(() => {
    const updatePosition = () => {
      if (popupRef.current) {
        const rect = popupRef.current.getBoundingClientRect();
        setPopupSize({ width: rect.width, height: rect.height });
      }

      const newPosition = calculatePopupPosition(step.position, elementRefs, popupSize.width, popupSize.height);
      setPosition(newPosition);
    };

    // Initial position calculation
    updatePosition();

    // Update on window resize and scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [step.position, elementRefs, popupSize.width, popupSize.height]);

  // Handle action-based progression
  useEffect(() => {
    if (step.progression.type === 'action' && targetElementRef) {
      const actionType = step.progression.action.type || 'click';
      
      if (actionType === 'click') {
        actionDetectionManager.attachClickListener(step.progression.action.actionId, targetElementRef, onNext);
      } else if (actionType === 'input') {
        actionDetectionManager.attachInputListener(step.progression.action.actionId, targetElementRef, onNext);
      }

      return () => {
        actionDetectionManager.removeListener(step.progression.action.actionId);
      };
    }
  }, [step.progression, targetElementRef, onNext]);

  const showNextButton = step.progression.type === 'button';
  const requiredAction = step.progression.type === 'action' ? step.progression.action : null;

  return (
    <>
      {/* Spotlight overlay */}
      {highlightStyle.type === 'spotlight' && (
        <SpotlightOverlay elementRef={targetElementRef} highlightStyle={highlightStyle} />
      )}

      {/* Element highlighter */}
      {(highlightStyle.type === 'outline' || highlightStyle.type === 'background') && (
        <ElementHighlighter elementRef={targetElementRef} highlightStyle={highlightStyle} />
      )}

      {/* Tutorial popup */}
      <Paper ref={popupRef} className={styles.popup} style={position} shadow='lg' p='md' withBorder>
        <div className={styles.header}>
          {step.title && (
            <Text size='lg' fw={600} className={styles.title}>
              {step.title}
            </Text>
          )}
          <ProgressIndicator currentStep={currentStepNumber} totalSteps={totalSteps} />
        </div>

        <div className={styles.content}>{step.content}</div>

        {requiredAction && (
          <div className={styles.actionRequired}>
            <Text size='sm' className={styles.actionText}>
              {requiredAction.description}
            </Text>
          </div>
        )}

        <div className={styles.footer}>
          <Button variant='subtle' color='gray' onClick={onEnd} size='sm'>
            {t('tutorial.endButton')}
          </Button>
          {showNextButton && (
            <Button onClick={onNext} size='sm'>
              {t('tutorial.nextButton')}
            </Button>
          )}
        </div>
      </Paper>
    </>
  );
}

export default TutorialStepPopup;

