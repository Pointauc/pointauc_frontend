import { useIsomorphicEffect } from '@mantine/hooks';
import { MutableRefObject, RefObject, createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollContextData {
  elementRef: RefObject<HTMLDivElement | null>;
}

export const ScrollContext = createContext<ScrollContextData>({
  elementRef: { current: null },
});

interface ScrollContextProviderProps {
  children: ReactNode;
}

export const ScrollContextProvider: React.FC<ScrollContextProviderProps> = ({ children }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  return <ScrollContext.Provider value={{ elementRef }}>{children}</ScrollContext.Provider>;
};

export const useScrollContext = (): ScrollContextData => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within ScrollContextProvider');
  }
  return context;
};

export interface UseWindowScrollPosition {
  x: number;
  y: number;
}

export type UseWindowScrollTo = (position: Partial<UseWindowScrollPosition>) => void;
export type UseWindowScrollReturnValue = [UseWindowScrollPosition, UseWindowScrollTo];

const getScrollPosition = (element?: HTMLElement | null): UseWindowScrollPosition => {
  if (element) {
    return { x: element.scrollLeft, y: element.scrollTop };
  }
  return typeof window !== 'undefined' ? { x: window.scrollX, y: window.scrollY } : { x: 0, y: 0 };
};

const scrollTo = ({ x, y }: Partial<UseWindowScrollPosition>, element?: HTMLElement | null) => {
  const scrollOptions: ScrollToOptions = { behavior: 'smooth' };

  if (typeof x === 'number') {
    scrollOptions.left = x;
  }

  if (typeof y === 'number') {
    scrollOptions.top = y;
  }

  if (element) {
    element.scrollTo(scrollOptions);
  } else if (typeof window !== 'undefined') {
    window.scrollTo(scrollOptions);
  }
};

export const useWindowScroll = (): UseWindowScrollReturnValue => {
  const { elementRef } = useScrollContext();

  // console.log(elementRef.current);
  const [position, setPosition] = useState<UseWindowScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updatePosition = () => setPosition(getScrollPosition(element));

    // Set initial position
    updatePosition();

    // Add scroll event listener to the context element
    element.addEventListener('scroll', updatePosition);

    return () => {
      element.removeEventListener('scroll', updatePosition);
    };
  }, [elementRef]);

  const scrollToPosition = (pos: Partial<UseWindowScrollPosition>) => {
    scrollTo(pos, elementRef.current);
  };

  return [position, scrollToPosition];
};

export const isFixed = (current: number, fixedAt: number) => current <= fixedAt;
export const isPinned = (current: number, previous: number) => current <= previous;
export const isReleased = (current: number, previous: number, fixedAt: number) =>
  !isPinned(current, previous) && !isFixed(current, fixedAt);

export const isPinnedOrReleased = (
  current: number,
  fixedAt: number,
  isCurrentlyPinnedRef: MutableRefObject<boolean>,
  isScrollingUp: boolean,
  onPin?: () => void,
  onRelease?: () => void,
) => {
  const isInFixedPosition = isFixed(current, fixedAt);
  if (isInFixedPosition && !isCurrentlyPinnedRef.current) {
    isCurrentlyPinnedRef.current = true;
    onPin?.();
  } else if (!isInFixedPosition && isScrollingUp && !isCurrentlyPinnedRef.current) {
    isCurrentlyPinnedRef.current = true;
    onPin?.();
  } else if (!isInFixedPosition && isCurrentlyPinnedRef.current) {
    isCurrentlyPinnedRef.current = false;
    onRelease?.();
  }
};

export const useScrollDirection = (): boolean => {
  const { elementRef } = useScrollContext();
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let resizeTimer: NodeJS.Timeout | undefined;

    const onResize = () => {
      setIsResizing(true);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsResizing(false);
      }, 300); // Reset the resizing flag after a timeout
    };

    const onScroll = () => {
      if (isResizing) {
        return; // Skip scroll events if resizing is in progress
      }
      const currentScrollTop = element.scrollTop;
      setIsScrollingUp(currentScrollTop < lastScrollTop);
      setLastScrollTop(currentScrollTop);
    };

    element.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);

    return () => {
      element.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [lastScrollTop, isResizing, elementRef]);

  return isScrollingUp;
};

export interface UseHeadroomOptions {
  /** Number in px at which element should be fixed */
  fixedAt?: number;

  /** Called when element is pinned */
  onPin?: () => void;

  /** Called when element is at fixed position */
  onFix?: () => void;

  /** Called when element is unpinned */
  onRelease?: () => void;
}

export const useHeadroom = ({ fixedAt = 0, onPin, onFix, onRelease }: UseHeadroomOptions = {}) => {
  const isCurrentlyPinnedRef = useRef(false);
  const isScrollingUp = useScrollDirection();
  const [{ y: scrollPosition }] = useWindowScroll();

  useIsomorphicEffect(() => {
    isPinnedOrReleased(scrollPosition, fixedAt, isCurrentlyPinnedRef, isScrollingUp, onPin, onRelease);
  }, [scrollPosition]);

  useIsomorphicEffect(() => {
    if (isFixed(scrollPosition, fixedAt)) {
      onFix?.();
    }
  }, [scrollPosition, fixedAt, onFix]);

  if (isFixed(scrollPosition, fixedAt) || isScrollingUp) {
    return true;
  }

  return false;
};
