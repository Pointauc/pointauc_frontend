import { Tutorial } from '@domains/tutorials/models/tutorial.model';

/**
 * Example tutorial demonstrating various features
 * This file can be used as a template for creating new tutorials
 */
export const exampleTutorial: Tutorial = {
  id: 'example-tutorial',
  title: 'Example Tutorial',
  description: 'This is an example tutorial showing how to use the tutorial system.',
  startType: 'modal', // Change to 'notification' for less intrusive start

  steps: [
    // Step 1: Simple centered explanation
    {
      id: 'welcome',
      title: 'Welcome!',
      content: 'This is the first step of the tutorial. It appears in the center of the screen.',
      position: {
        type: 'predefined',
        position: 'center',
      },
      progression: {
        type: 'button', // User clicks "Next Step" button
      },
    },

    // Step 2: Highlight an element with outline
    {
      id: 'highlight-example',
      title: 'Element Highlighting',
      content: 'This step highlights a specific element with an outline effect.',
      targetElementId: 'example-element',
      position: {
        type: 'element',
        position: {
          elementId: 'example-element',
          relativePosition: 'bottom',
          offset: { y: 10 },
        },
      },
      highlightStyle: {
        type: 'outline',
        outlineColor: '#4299e1',
      },
      progression: {
        type: 'button',
      },
    },

    // Step 3: Spotlight effect with action-based progression
    {
      id: 'action-example',
      content: 'Now try clicking on this button to proceed to the next step.',
      targetElementId: 'action-button',
      position: {
        type: 'element',
        position: {
          elementId: 'action-button',
          relativePosition: 'top',
        },
      },
      highlightStyle: {
        type: 'spotlight',
        spotlightPadding: 12,
      },
      progression: {
        type: 'action',
        action: {
          actionId: 'click-action-button',
          description: 'Click the highlighted button',
          elementId: 'action-button',
          type: 'click',
        },
      },
    },

    // Step 4: Background highlight
    {
      id: 'background-example',
      title: 'Background Highlight',
      content: 'This step uses a background highlight to draw attention to an element.',
      targetElementId: 'highlighted-area',
      position: {
        type: 'element',
        position: {
          elementId: 'highlighted-area',
          relativePosition: 'right',
          offset: { x: 10 },
        },
      },
      highlightStyle: {
        type: 'background',
        backgroundColor: 'rgba(66, 153, 225, 0.3)',
      },
      progression: {
        type: 'button',
      },
    },

    // Step 5: Absolute positioning
    {
      id: 'absolute-position',
      title: 'Custom Positioning',
      content: 'This popup is positioned using absolute coordinates.',
      position: {
        type: 'absolute',
        position: {
          top: '100px',
          right: '50px',
        },
      },
      progression: {
        type: 'button',
      },
    },

    // Step 6: Completion
    {
      id: 'complete',
      title: 'Tutorial Complete!',
      content: 'You have completed the tutorial. Great job!',
      position: {
        type: 'predefined',
        position: 'center',
      },
      progression: {
        type: 'button',
      },
    },
  ],

  // Optional callbacks
  onStart: () => {
    console.log('Tutorial started');
  },
  onComplete: () => {
    console.log('Tutorial completed');
  },
  onCancel: () => {
    console.log('Tutorial cancelled');
  },
};

