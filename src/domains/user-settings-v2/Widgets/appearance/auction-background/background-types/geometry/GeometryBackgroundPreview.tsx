import { type ISourceOptions, MoveDirection, OutMode } from '@tsparticles/engine';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useEffect, useMemo, useState } from 'react';

let initializeParticlesPromise: Promise<void> | null = null;

const initializeParticles = (): Promise<void> => {
  initializeParticlesPromise ??= initParticlesEngine(async (engine) => {
    await loadSlim(engine);
  });

  return initializeParticlesPromise;
};

interface GeometryBackgroundPreviewProps {
  isPreview?: boolean;
}

const GeometryBackgroundPreview = ({ isPreview = false }: GeometryBackgroundPreviewProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const options = useMemo<ISourceOptions>(
    () => ({
      autoPlay: true,
      background: {
        color: {
          value: 'transparent',
        },
      },
      detectRetina: true,
      fullScreen: {
        enable: false,
      },
      fpsLimit: isPreview ? 48 : 60,
      interactivity: {
        detectsOn: 'canvas',
        events: {
          resize: {
            enable: true,
          },
        },
      },
      particles: {
        color: {
          value: ['#69e6ff', '#f5d76e', '#f7f7fb'],
        },
        links: {
          color: '#b8f3ff',
          distance: isPreview ? 86 : 145,
          enable: true,
          opacity: isPreview ? 0.32 : 0.24,
          triangles: {
            enable: true,
            color: '#69e6ff',
            opacity: isPreview ? 0.035 : 0.025,
          },
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: false,
          speed: isPreview ? 0.7 : 0.45,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: isPreview ? 24 : 90,
        },
        opacity: {
          value: {
            min: 0.28,
            max: 0.72,
          },
        },
        shape: {
          type: 'polygon',
          options: {
            polygon: {
              sides: 6,
            },
          },
        },
        size: {
          value: {
            min: isPreview ? 1.4 : 1.2,
            max: isPreview ? 3.4 : 4.2,
          },
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
    }),
    [isPreview],
  );

  useEffect(() => {
    let isMounted = true;

    void initializeParticles().then(() => {
      if (isMounted) {
        setIsInitialized(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className='relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(105,230,255,0.16),transparent_30%),linear-gradient(135deg,#090b12_0%,#181324_52%,#0a1317_100%)]'>
      {isInitialized ? (
        <Particles
          id={isPreview ? 'auction-geometry-background-preview' : 'auction-geometry-background'}
          className='absolute inset-0 h-full w-full'
          options={options}
        />
      ) : null}
    </div>
  );
};

export default GeometryBackgroundPreview;
