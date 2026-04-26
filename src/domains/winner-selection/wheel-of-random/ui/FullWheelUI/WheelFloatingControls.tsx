import classNames from 'classnames';
import { ActionIcon, Drawer, Loader, Tooltip } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';
import WheelSettings from '@domains/winner-selection/wheel-of-random/settings/ui/Form/WheelSettings';
import SpinTimeComposed from '@domains/winner-selection/wheel-of-random/settings/ui/Fields/Soundtrack/SpinTimeComposed';

import { RevealedData } from '../../lib/hooks/useTicketManagement';

const SPIN_BUTTON_CONFIG = {
  size: {
    width: 196,
    height: 86,
    topSurfaceHeight: 64,
    topSurfaceOffset: 2,
    depthSurfaceOffset: 16,
    ringOffset: 8,
    ringOverhang: 8,
    borderRadius: 12,
    ringBorderRadius: 16,
  },
  motion: {
    pressTravel: 14,
    halfPressProgress: 0.5,
    minimumPressDuration: 120,
    pressDurationPerProgress: 360,
    cssTransitionDuration: 820,
    hoverWobbleDuration: 300,
    hoverWobbleUp: -2,
    hoverWobbleDown: 1,
    easing: (progress: number) => 1 - Math.pow(1 - progress, 3),
    easingCss: 'cubic-bezier(0.2, 0.9, 0.12, 1)',
  },
  colors: {
    ring: '#5c1b16',
    ringTopEdge: '#8d3025',
    ringDepth: '#260a08',
    depthSurface: '#702119',
    topSurface: '#e64c38',
    pressedTopSurface: '#572019',
    pressedText: '#f1b1a8',
  },
};

type SpinButtonStyle = CSSProperties & Record<`--wheel-spin-button-${string}`, string | number>;

interface WheelFloatingControlsProps {
  availableQuota?: number | null;
  children: ReactNode;
  controls: Wheel.SettingControls;
  isCreatingTicket?: boolean;
  isLoadingSeed: boolean;
  renderSubmitButton?: (defaultButton: ReactNode) => ReactNode;
  ticketData?: RevealedData | null;
  ticketError?: Error | null;
}

const WheelFloatingControls = ({
  availableQuota,
  children,
  controls,
  isCreatingTicket,
  isLoadingSeed,
  renderSubmitButton,
  ticketData,
  ticketError,
}: WheelFloatingControlsProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext<Wheel.Settings>();
  const { isSubmitting } = useFormState<Wheel.Settings>({ control });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPressInteractionActive, setIsPressInteractionActive] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const pressAnimationFrameRef = useRef<number | null>(null);
  const pressProgressRef = useRef(0);
  const hasPointerReleasedRef = useRef(true);
  const isSpinDisabled = isSubmitting;
  const isSpinLoading = isLoadingSeed || isCreatingTicket;
  const pressState = isSpinDisabled ? 'pressed' : 'idle';
  const spinButtonStyle: SpinButtonStyle = {
    '--wheel-spin-button-width': `${SPIN_BUTTON_CONFIG.size.width}px`,
    '--wheel-spin-button-height': `${SPIN_BUTTON_CONFIG.size.height}px`,
    '--wheel-spin-button-top-height': `${SPIN_BUTTON_CONFIG.size.topSurfaceHeight}px`,
    '--wheel-spin-button-top-offset': `${SPIN_BUTTON_CONFIG.size.topSurfaceOffset}px`,
    '--wheel-spin-button-depth-offset': `${SPIN_BUTTON_CONFIG.size.depthSurfaceOffset}px`,
    '--wheel-spin-button-ring-offset': `${SPIN_BUTTON_CONFIG.size.ringOffset}px`,
    '--wheel-spin-button-ring-overhang': `${SPIN_BUTTON_CONFIG.size.ringOverhang}px`,
    '--wheel-spin-button-radius': `${SPIN_BUTTON_CONFIG.size.borderRadius}px`,
    '--wheel-spin-button-ring-radius': `${SPIN_BUTTON_CONFIG.size.ringBorderRadius}px`,
    '--wheel-spin-button-travel': `${SPIN_BUTTON_CONFIG.motion.pressTravel}px`,
    '--wheel-spin-button-transition-duration': `${SPIN_BUTTON_CONFIG.motion.cssTransitionDuration}ms`,
    '--wheel-spin-button-transition-easing': SPIN_BUTTON_CONFIG.motion.easingCss,
    '--wheel-spin-button-hover-duration': `${SPIN_BUTTON_CONFIG.motion.hoverWobbleDuration}ms`,
    '--wheel-spin-button-hover-up': `${SPIN_BUTTON_CONFIG.motion.hoverWobbleUp}px`,
    '--wheel-spin-button-hover-down': `${SPIN_BUTTON_CONFIG.motion.hoverWobbleDown}px`,
    '--wheel-spin-button-ring-color': SPIN_BUTTON_CONFIG.colors.ring,
    '--wheel-spin-button-ring-top-edge-color': SPIN_BUTTON_CONFIG.colors.ringTopEdge,
    '--wheel-spin-button-ring-depth-color': SPIN_BUTTON_CONFIG.colors.ringDepth,
    '--wheel-spin-button-depth-color': SPIN_BUTTON_CONFIG.colors.depthSurface,
    '--wheel-spin-button-top-color': SPIN_BUTTON_CONFIG.colors.topSurface,
    '--wheel-spin-button-pressed-top-color': SPIN_BUTTON_CONFIG.colors.pressedTopSurface,
    '--wheel-spin-button-pressed-text-color': SPIN_BUTTON_CONFIG.colors.pressedText,
  };

  const setPressProgress = useCallback((progress: number) => {
    const nextProgress = Math.min(Math.max(progress, 0), 1);
    pressProgressRef.current = nextProgress;
    submitButtonRef.current?.style.setProperty('--wheel-spin-button-press', nextProgress.toString());
  }, []);

  const stopPressAnimation = useCallback(() => {
    if (pressAnimationFrameRef.current != null) {
      window.cancelAnimationFrame(pressAnimationFrameRef.current);
      pressAnimationFrameRef.current = null;
    }
  }, []);

  const animatePressTo = useCallback(
    (targetProgress: number, onComplete?: () => void) => {
      stopPressAnimation();

      const startProgress = pressProgressRef.current;
      const distance = Math.abs(targetProgress - startProgress);

      if (distance < 0.01) {
        setPressProgress(targetProgress);
        onComplete?.();
        return;
      }

      const startedAt = performance.now();
      const duration = Math.max(
        SPIN_BUTTON_CONFIG.motion.minimumPressDuration,
        distance * SPIN_BUTTON_CONFIG.motion.pressDurationPerProgress,
      );

      const step = (timestamp: number) => {
        const elapsed = timestamp - startedAt;
        const rawProgress = Math.min(elapsed / duration, 1);
        const easedProgress = SPIN_BUTTON_CONFIG.motion.easing(rawProgress);

        setPressProgress(startProgress + (targetProgress - startProgress) * easedProgress);

        if (rawProgress < 1) {
          pressAnimationFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        pressAnimationFrameRef.current = null;
        onComplete?.();
      };

      pressAnimationFrameRef.current = window.requestAnimationFrame(step);
    },
    [setPressProgress, stopPressAnimation],
  );

  const completePressAnimation = useCallback(() => {
    hasPointerReleasedRef.current = true;
    setIsPressInteractionActive(true);
    animatePressTo(1, () => setIsPressInteractionActive(false));
  }, [animatePressTo]);

  const startPressAnimation = useCallback(() => {
    if (isSpinDisabled) return;

    hasPointerReleasedRef.current = false;
    setIsPressInteractionActive(true);
    animatePressTo(SPIN_BUTTON_CONFIG.motion.halfPressProgress, () => {
      if (hasPointerReleasedRef.current) {
        completePressAnimation();
      }
    });
  }, [animatePressTo, completePressAnimation, isSpinDisabled]);

  useEffect(
    () => () => {
      stopPressAnimation();
    },
    [stopPressAnimation],
  );

  useEffect(() => {
    if (isSpinDisabled) {
      hasPointerReleasedRef.current = true;
      setIsPressInteractionActive(false);
      animatePressTo(1);
      return;
    }

    animatePressTo(0);
  }, [animatePressTo, isSpinDisabled]);

  const defaultSubmitButton = (
    <button
      ref={submitButtonRef}
      className={classNames(
        'wheel-spin-button group relative isolate h-[var(--wheel-spin-button-height)] w-[var(--wheel-spin-button-width)] cursor-pointer border-0 bg-transparent px-0 pb-0 text-lg font-black tracking-normal text-white uppercase outline-none',
        '[filter:drop-shadow(0_18px_18px_rgba(0,0,0,0.34))] transition-[filter,transform] duration-300 ease-out',
        'focus-visible:[filter:drop-shadow(0_0_0_rgba(0,0,0,0))]',
        'disabled:cursor-not-allowed disabled:[filter:none]',
      )}
      data-press-state={pressState}
      disabled={isSpinDisabled}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          startPressAnimation();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          completePressAnimation();
        }
      }}
      onPointerCancel={completePressAnimation}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        startPressAnimation();
      }}
      onPointerUp={completePressAnimation}
      style={spinButtonStyle}
      type='submit'
    >
      <span
        className={classNames(
          'absolute top-[var(--wheel-spin-button-ring-offset)] bottom-0 rounded-[var(--wheel-spin-button-ring-radius)] bg-[var(--wheel-spin-button-ring-color)]',
          'right-[calc(var(--wheel-spin-button-ring-overhang)*-1)] left-[calc(var(--wheel-spin-button-ring-overhang)*-1)]',
          'shadow-[inset_0_3px_0_var(--wheel-spin-button-ring-top-edge-color),0_10px_0_var(--wheel-spin-button-ring-depth-color)]',
          'transition-shadow duration-500 ease-out',
        )}
      />
      <span
        className={classNames(
          'absolute inset-x-0 top-[var(--wheel-spin-button-depth-offset)] h-[var(--wheel-spin-button-top-height)] rounded-[var(--wheel-spin-button-radius)] bg-[var(--wheel-spin-button-depth-color)]',
          'transition-[background-color,opacity] duration-500 ease-out',
        )}
      />
      <span
        className={classNames(
          'wheel-spin-button-ring-shadow absolute inset-x-[-2px] top-[10px] h-[22px] rounded-t-[14px]',
          'bg-[linear-gradient(180deg,rgba(18,4,3,0.58),rgba(18,4,3,0.18)_54%,transparent)] opacity-0',
        )}
      />
      <span
        className={classNames(
          'wheel-spin-button-tip absolute inset-x-0 top-[var(--wheel-spin-button-top-offset)] h-[var(--wheel-spin-button-top-height)] overflow-hidden rounded-[var(--wheel-spin-button-radius)] bg-[var(--wheel-spin-button-top-color)]',
          'shadow-[inset_0_0_0_2px_rgba(255,255,255,0.10),inset_9px_0_0_rgba(255,145,120,0.14),inset_-9px_0_0_rgba(92,18,14,0.18),inset_0_-5px_0_rgba(85,17,13,0.16)]',
          !isSpinDisabled &&
            !isPressInteractionActive &&
            'group-hover:[animation:wheelSpinButtonTipHoverWobble_var(--wheel-spin-button-hover-duration)_ease-out_1]',
        )}
      >
        <span className='wheel-spin-button-sheen absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12),transparent_18%,transparent_82%,rgba(63,12,9,0.20)),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%,rgba(54,10,8,0.14))]' />
      </span>
      <span
        className={classNames(
          'wheel-spin-button-content absolute inset-x-0 top-0 z-10 flex h-[var(--wheel-spin-button-top-height)] items-center justify-center gap-2 px-7',
          !isSpinDisabled &&
            !isPressInteractionActive &&
            'group-hover:[animation:wheelSpinButtonTipHoverWobble_var(--wheel-spin-button-hover-duration)_ease-out_1]',
        )}
      >
        {isSpinLoading && <Loader color='white' size='sm' />}
        <span className='drop-shadow-[0_2px_0_rgba(72,15,11,0.62)]'>
          {isSubmitting ? t('wheel.spinning') : t('wheel.spin')}
        </span>
        {!isSpinDisabled && <HotkeyHint actionId={HOTKEY_ACTION_IDS.wheelSpin} />}
      </span>
    </button>
  );

  useAppHotkey(
    HOTKEY_ACTION_IDS.wheelSpin,
    (event) => {
      event.preventDefault();
      submitButtonRef.current?.click();
    },
    {
      enabled: !isSpinDisabled && !isLoadingSeed && !isCreatingTicket,
      preventDefault: true,
    },
  );

  return (
    <>
      <style>
        {`
          @keyframes wheelSpinButtonTipHoverWobble {
            0% { transform: translateY(0); }
            42% { transform: translateY(var(--wheel-spin-button-hover-up)); }
            72% { transform: translateY(var(--wheel-spin-button-hover-down)); }
            100% { transform: translateY(0); }
          }

          .wheel-spin-button-tip,
          .wheel-spin-button-content,
          .wheel-spin-button-sheen {
            transition-duration: 820ms;
            transition-duration: var(--wheel-spin-button-transition-duration);
            transition-timing-function: var(--wheel-spin-button-transition-easing);
          }

          .wheel-spin-button-tip {
            transform: translateY(calc(var(--wheel-spin-button-press, 0) * var(--wheel-spin-button-travel)));
            transition-property: background-color, box-shadow;
            will-change: transform, background-color, box-shadow;
          }

          .wheel-spin-button-content {
            transform: translateY(calc(var(--wheel-spin-button-press, 0) * var(--wheel-spin-button-travel)));
            transition-property: color;
            will-change: transform, color;
          }

          .wheel-spin-button-sheen {
            transition-property: opacity;
          }

          .wheel-spin-button[data-press-state="pressed"] .wheel-spin-button-tip {
            background-color: var(--wheel-spin-button-pressed-top-color);
            box-shadow:
              inset 0 0 0 2px rgba(0, 0, 0, 0.18),
              inset 0 11px 18px rgba(18, 4, 3, 0.52),
              inset 0 -8px 14px rgba(102, 38, 30, 0.18);
          }

          .wheel-spin-button[data-press-state="pressed"] .wheel-spin-button-content {
            color: var(--wheel-spin-button-pressed-text-color);
          }

          .wheel-spin-button[data-press-state="pressed"] .wheel-spin-button-sheen {
            opacity: 0.7;
          }

          .wheel-spin-button[data-press-state="pressed"] .wheel-spin-button-ring-shadow {
            opacity: 1;
          }
        `}
      </style>
      <div
        className={classNames(
          'absolute left-1/2 z-20 flex w-max max-w-[min(92vw,760px)] items-center gap-3 rounded-lg border border-white/15 bg-[#1d2026]/90 px-4 py-3 text-[#e9edf3] shadow-[0_18px_42px_rgba(0,0,0,0.34)] backdrop-blur-md',
          'transition-[top,transform,box-shadow] duration-500 ease-out',
          isSubmitting
            ? // ? 'top-[calc(100%-108px)] -translate-x-1/2 translate-y-0 scale-[0.82] shadow-[0_10px_24px_rgba(0,0,0,0.28)]'
              'top-[58%] -translate-x-1/2 -translate-y-1/2 scale-100'
            : 'top-[58%] -translate-x-1/2 -translate-y-1/2 scale-100',
        )}
      >
        {renderSubmitButton ? renderSubmitButton(defaultSubmitButton) : defaultSubmitButton}
        <div className='min-w-[220px]'>
          <SpinTimeComposed disabled={isSubmitting} />
        </div>
        <Tooltip label={t('wheel.settingsButton')}>
          <ActionIcon
            aria-label={t('wheel.settingsButton')}
            onClick={() => setIsSettingsOpen(true)}
            radius='md'
            size='xl'
            type='button'
            variant='light'
          >
            <IconSettings size={24} />
          </ActionIcon>
        </Tooltip>
      </div>
      <Drawer
        opened={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        padding='md'
        position='right'
        size='xl'
        title={t('wheel.settingsDrawerTitle')}
      >
        <WheelSettings
          availableQuota={availableQuota}
          controls={controls}
          ticketData={ticketData}
          ticketError={ticketError}
        >
          {children}
        </WheelSettings>
      </Drawer>
    </>
  );
};

export default WheelFloatingControls;
