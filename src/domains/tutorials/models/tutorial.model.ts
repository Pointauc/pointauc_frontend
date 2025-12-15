import { ReactNode, RefObject } from 'react';

/**
 * Predefined positions for tutorial popups
 */
export type PredefinedPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

/**
 * Relative position when popup is positioned near an element
 */
export type RelativePosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Absolute position configuration using CSS units
 */
export interface AbsolutePosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

/**
 * Element-relative position configuration
 */
export interface ElementRelativePosition {
  elementId: string;
  relativePosition: RelativePosition;
  offset?: {
    x?: number;
    y?: number;
  };
}

/**
 * Position configuration for tutorial popup
 */
export type TutorialPosition = 
  | { type: 'predefined'; position: PredefinedPosition }
  | { type: 'absolute'; position: AbsolutePosition }
  | { type: 'element'; position: ElementRelativePosition };

/**
 * Highlight style for tutorial elements
 */
export type HighlightType = 'outline' | 'background' | 'spotlight' | 'none';

export interface HighlightStyle {
  type: HighlightType;
  /** Additional spotlight options */
  spotlightPadding?: number;
  /** Outline color (for outline type) */
  outlineColor?: string;
  /** Background color (for background type) */
  backgroundColor?: string;
}

/**
 * Action required for step progression
 */
export interface RequiredAction {
  /** Unique action identifier */
  actionId: string;
  /** Description of the action user needs to perform */
  description: string;
  /** Element that needs to be interacted with */
  elementId?: string;
  /** Type of action expected */
  type?: 'click' | 'input' | 'custom';
}

/**
 * Step progression configuration
 */
export type StepProgression = 
  | { type: 'button' } // Show "Next Step" button
  | { type: 'action'; action: RequiredAction }; // Require specific action

/**
 * Individual tutorial step configuration
 */
export interface TutorialStep {
  /** Unique step identifier */
  id: string;
  /** Step title */
  title?: string;
  /** Step content/explanation (can be JSX) */
  content: ReactNode;
  /** Target element to highlight */
  targetElementId?: string;
  /** Popup position configuration */
  position: TutorialPosition;
  /** Highlight style for the target element */
  highlightStyle?: HighlightStyle;
  /** How to progress to next step */
  progression: StepProgression;
  /** Optional callback when step becomes active */
  onEnter?: () => void;
  /** Optional callback when leaving this step */
  onExit?: () => void;
}

/**
 * Tutorial start method
 */
export type TutorialStartType = 'modal' | 'notification';

/**
 * Complete tutorial configuration
 */
export interface Tutorial {
  /** Unique tutorial identifier */
  id: string;
  /** Tutorial title */
  title: string;
  /** Tutorial description (shown in start modal) */
  description: string;
  /** How to initiate the tutorial */
  startType: TutorialStartType;
  /** Tutorial steps */
  steps: TutorialStep[];
  /** Optional callback when tutorial starts */
  onStart?: () => void;
  /** Optional callback when tutorial completes */
  onComplete?: () => void;
  /** Optional callback when tutorial is cancelled */
  onCancel?: () => void;
}

/**
 * Tutorial context state
 */
export interface TutorialContextState {
  /** Currently active tutorial */
  activeTutorial: Tutorial | null;
  /** Current step index */
  currentStepIndex: number;
  /** Registered element refs */
  elementRefs: Map<string, RefObject<HTMLElement>>;
  /** Start a tutorial */
  startTutorial: (tutorial: Tutorial) => void;
  /** Stop current tutorial */
  stopTutorial: () => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  previousStep: () => void;
  /** Register an element for tutorials */
  registerElement: (id: string, ref: RefObject<HTMLElement>) => void;
  /** Unregister an element */
  unregisterElement: (id: string) => void;
  /** Trigger an action (for action-based progression) */
  triggerAction: (actionId: string) => void;
  /** Check if tutorial is completed */
  isTutorialCompleted: (tutorialId: string) => boolean;
  /** Mark tutorial as completed */
  markTutorialCompleted: (tutorialId: string) => void;
}

