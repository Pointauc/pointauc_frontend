import * as Integration from '@models/integration';

const TourniquetIcon = ({ classes, size }: Integration.IconProps) => {
  return (
    <svg
      width={size || 28}
      height={size || 28}
      className={classes}
      viewBox='0 0 28 28'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect width='28' height='28' rx='8' fill='#FFFF00'></rect>
      <line x1='17.6345' y1='20.6207' x2='12.6344' y2='9.6207' stroke='black' strokeWidth='3'></line>
      <line x1='9.56326' y1='20.569' x2='12.5633' y2='10.569' stroke='black' strokeWidth='3'></line>
      <line x1='13.431' y1='10.5633' x2='23.431' y2='13.5633' stroke='black' strokeWidth='3'></line>
      <line x1='4.29412' y1='14.6765' x2='19.2941' y2='6.67647' stroke='black' strokeWidth='3'></line>
    </svg>
  );
};

export default TourniquetIcon;
