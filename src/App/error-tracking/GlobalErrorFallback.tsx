import i18n from '@assets/i18n/index.ts';
import { isBrowser } from '@utils/ssr';

interface GlobalErrorFallbackProps {
  onRetry?: () => void;
}

export function GlobalErrorFallback({ onRetry }: GlobalErrorFallbackProps) {
  const handleRetry = () => {
    if (isBrowser) {
      window.location.reload();
      return;
    }

    onRetry?.();
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-900 px-6 text-zinc-100'>
      <div
        role='alert'
        className='w-full max-w-[520px] rounded-2xl bg-zinc-800 p-8 shadow-2xl'
      >
        <h1 className='mb-3 text-[28px] font-bold'>{i18n.t('globalErrorBoundary.title')}</h1>
        <p className='mb-6 leading-[1.6] text-zinc-300'>{i18n.t('globalErrorBoundary.description')}</p>
        <button
          type='button'
          onClick={handleRetry}
          className='cursor-pointer rounded-[10px] bg-sky-500 px-[18px] py-3 text-[15px] font-semibold text-zinc-950 transition-colors hover:bg-sky-400'
        >
          {i18n.t('globalErrorBoundary.reload')}
        </button>
      </div>
    </div>
  );
}
