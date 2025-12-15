import { useEffect, useRef } from 'react';

import { useTutorialContext } from '@domains/tutorials/context/TutorialContext';

/**
 * Hook to register an element for tutorials
 * Returns a ref that should be attached to the element
 */
export function useTutorialElement<T extends HTMLElement = HTMLElement>(elementId: string) {
  const { registerElement, unregisterElement } = useTutorialContext();
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (elementRef.current) {
      registerElement(elementId, elementRef as any);
    }

    return () => {
      unregisterElement(elementId);
    };
  }, [elementId, registerElement, unregisterElement]);

  return elementRef;
}

