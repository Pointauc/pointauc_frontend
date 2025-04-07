import { useEffect, RefObject, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface AutoScrollOptions {
  scrollSpeed?: number;
  pauseOnEdgesDuration?: number;
  mouseResumeDelay?: number;
}

/**
 * Hook for auto-scrolling a container element
 *
 * @param containerRef - Container element (HTMLDivElement) to be scrolled
 * @param itemCount - The number of items within the container
 * @param isAutoScroll - Flag indicating if auto-scrolling is enabled
 * @param options - Optional configuration
 *   @property {number} [scrollSpeed=50] - The speed of scrolling (pixels per second)
 *   @property {number} [pauseOnEdgesDuration=2] - The pause duration (in seconds) at the edges of scrolling
 *   @property {number} [mouseResumeDelay=5] - The delay (in seconds) before resuming auto-scroll after mouse leave
 */
const useAutoScroll = (
  containerRef: RefObject<HTMLDivElement>,
  itemCount: number,
  isAutoScroll: boolean,
  options?: AutoScrollOptions,
): void => {
  const { scrollSpeed = 50, pauseOnEdgesDuration = 2, mouseResumeDelay = 5 } = options || {};
  const isAutoScrollDisabledRef = useRef(false);
  const isPausedByUserRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const directionRef = useRef<'down' | 'up'>('down');
  const mouseResumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef(0);
  const prevContainerRef = useRef<HTMLDivElement | null>();

  const cleanup = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
    progressRef.current = 0;
  }, []);

  const startSegment = useCallback(() => {
    if (isAutoScrollDisabledRef.current || isPausedByUserRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    cleanup();

    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return;

    const currentScroll = el.scrollTop;
    const isDown = directionRef.current === 'down';
    let target = isDown ? maxScroll : 0;

    // Auto-correction of direction
    if (isDown && currentScroll >= maxScroll - 1) {
      directionRef.current = 'up';
      target = 0;
    } else if (!isDown && currentScroll <= 1) {
      directionRef.current = 'down';
      target = maxScroll;
    }

    const distance = Math.abs(target - currentScroll);
    if (distance <= 1) {
      directionRef.current = isDown ? 'up' : 'down';
      gsap.delayedCall(pauseOnEdgesDuration, startSegment);
      return;
    }

    const duration = Math.max(0.1, distance / scrollSpeed);

    tweenRef.current = gsap.to(el, {
      scrollTop: target,
      duration,
      ease: 'none',
      onUpdate: () => {
        progressRef.current = tweenRef.current?.progress() || 0;
      },
      onComplete: () => {
        if (isAutoScrollDisabledRef.current || isPausedByUserRef.current) return;
        directionRef.current = isDown ? 'up' : 'down';
        gsap.delayedCall(pauseOnEdgesDuration, startSegment);
      },
    });
  }, [containerRef, scrollSpeed, pauseOnEdgesDuration, cleanup]);

  const handleResize = useCallback(() => {
    if (isAutoScrollDisabledRef.current || isPausedByUserRef.current) return;
    isAutoScrollDisabledRef.current = true;
    cleanup();

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      isAutoScrollDisabledRef.current = false;
      const el = containerRef.current;
      if (el) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        el.scrollTop = Math.min(el.scrollTop, maxScroll);
      }
      startSegment();
    }, 300);
  }, [containerRef, startSegment, cleanup]);

  const debouncedResize = useCallback(() => {
    requestAnimationFrame(handleResize);
  }, [handleResize]);

  // Cleanup and wait 1 sec after container change
  useEffect(() => {
    if (!isAutoScroll) return;

    if (prevContainerRef.current !== containerRef.current) {
      const timeoutId = setTimeout(() => {
        isPausedByUserRef.current = false;
        startSegment();
      }, 1000);

      isPausedByUserRef.current = true;
      cleanup();
      prevContainerRef.current = containerRef.current;

      return () => {
        clearTimeout(timeoutId);
        isPausedByUserRef.current = false;
      };
    }
  }, [containerRef, isAutoScroll]);

  useEffect(() => {
    if (!isAutoScroll) return;
    const el = containerRef.current;
    if (!el) return;

    isAutoScrollDisabledRef.current = false;
    startSegment();

    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(el);

    const handleMouseEnter = () => {
      isPausedByUserRef.current = true;
      tweenRef.current?.pause();
      if (mouseResumeTimeoutRef.current) {
        clearTimeout(mouseResumeTimeoutRef.current);
        mouseResumeTimeoutRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      isPausedByUserRef.current = false;
      if (mouseResumeTimeoutRef.current) clearTimeout(mouseResumeTimeoutRef.current);
      mouseResumeTimeoutRef.current = setTimeout(() => {
        if (isAutoScrollDisabledRef.current) return;
        cleanup();
        startSegment();
      }, mouseResumeDelay * 1000);
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isAutoScrollDisabledRef.current = true;
      cleanup();
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      if (mouseResumeTimeoutRef.current) clearTimeout(mouseResumeTimeoutRef.current);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, isAutoScroll, startSegment, debouncedResize, mouseResumeDelay, cleanup]);

  // Scroll recalculation after itemCount changes
  useEffect(() => {
    if (!isAutoScroll) return;
    debouncedResize();
  }, [itemCount, debouncedResize]);
};

export default useAutoScroll;
