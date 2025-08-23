import { FC, useEffect, useRef } from 'react';
import { alpha, DEFAULT_THEME } from '@mantine/core';

interface OverlayThemeScopeProps {
  children: React.ReactNode;
  backgroundTransparency?: number; // 0-1
  className?: string;
}

const OverlayThemeScope: FC<OverlayThemeScopeProps> = ({ children, backgroundTransparency = 0, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Generate darkTransparent colors with overlay-specific alpha
    const darkTransparentColors = DEFAULT_THEME.colors.dark.map((color) => alpha(color, backgroundTransparency));

    container.style.setProperty('--mantine-color-backgroundTransparency', backgroundTransparency.toString());

    // Set CSS custom properties scoped to this container
    darkTransparentColors.forEach((color, index) => {
      container.style.setProperty(`--mantine-color-darkTransparent-${index}`, color);
    });

    // Cleanup function
    return () => {
      darkTransparentColors.forEach((_, index) => {
        container.style.removeProperty(`--mantine-color-darkTransparent-${index}`);
      });
    };
  }, [backgroundTransparency]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default OverlayThemeScope;
