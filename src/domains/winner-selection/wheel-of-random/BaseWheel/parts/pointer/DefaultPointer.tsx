import { useId } from 'react';

import classes from '../../BaseWheel.module.css';

import type { PointerProps } from '../types';

const DefaultPointer = ({ layout }: PointerProps) => {
  const idPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const size = Math.max(62, Math.round(layout.targetWheelSize * 0.17));
  const gradientId = `${idPrefix}-gradient`;
  const coreGradientId = `${idPrefix}-core-gradient`;
  const capGradientId = `${idPrefix}-cap-gradient`;
  const shadowId = `${idPrefix}-shadow`;

  return (
    <svg
      className={classes.wheelPointer}
      style={{ transform: `translate(-50%, -34%)` }}
      width={size}
      height={size}
      viewBox='0 0 160 160'
      aria-hidden='true'
    >
      <defs>
        <linearGradient id={gradientId} x1='34' y1='14' x2='122' y2='132' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#FECACA' />
          <stop offset='0.24' stopColor='#F04444' />
          <stop offset='0.68' stopColor='#991B1B' />
          <stop offset='1' stopColor='#450A0A' />
        </linearGradient>
        <linearGradient id={coreGradientId} x1='58' y1='34' x2='104' y2='120' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#FFF5F5' stopOpacity='1' />
          <stop offset='0.18' stopColor='#FDB4B4' stopOpacity='0.98' />
          <stop offset='0.56' stopColor='#FB4A4A' stopOpacity='0.95' />
          <stop offset='1' stopColor='#7F1D1D' stopOpacity='0.98' />
        </linearGradient>
        <linearGradient id={capGradientId} x1='56' y1='16' x2='104' y2='44' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#FFE4E6' />
          <stop offset='0.42' stopColor='#FB5252' />
          <stop offset='1' stopColor='#7F1D1D' />
        </linearGradient>
        <filter id={shadowId} x='16' y='6' width='128' height='144' filterUnits='userSpaceOnUse'>
          <feOffset dy='8' />
          <feGaussianBlur stdDeviation='8' />
          <feColorMatrix type='matrix' values='0 0 0 0 0.35 0 0 0 0 0.03 0 0 0 0 0.06 0 0 0 0.4 0' />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path
          d='M80 16L102 31L112 47L102 62L97 84L90 104L80 132L70 104L63 84L58 62L48 47L58 31L80 16Z'
          fill={`url(#${gradientId})`}
        />
      </g>

      <path d='M80 17L100 31L109 46L100 61L95 83L89 102L80 129L71 102L65 83L60 61L51 46L60 31L80 17Z' fill='#5B1111' />

      <path
        d='M80 20L98 33L107 47L98 61L93 82L87 101L80 122L73 101L67 82L62 61L53 47L62 33L80 20Z'
        fill={`url(#${coreGradientId})`}
        opacity='0.9'
      />

      <path d='M80 20L98 33L89 40L80 35L71 40L62 33L80 20Z' fill={`url(#${capGradientId})`} />

      <path d='M80 38L85 52L83 77L80 112L77 77L75 52L80 38Z' fill='#2A0505' opacity='0.92' />
      <path d='M58 31L80 20L72 44L66 72L58 31Z' fill='rgba(255, 255, 255, 0.2)' />
      <path d='M102 31L89 44L94 82L102 62L107 47L102 31Z' fill='rgba(42, 5, 5, 0.22)' />

      <path
        d='M80 16L102 31L112 47L102 62L97 84L90 104L80 132L70 104L63 84L58 62L48 47L58 31L80 16Z'
        fill='none'
        stroke='rgba(255, 238, 240, 0.9)'
        strokeWidth='2.2'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default DefaultPointer;
