import React from 'react';

import LinkedText from '@components/LinkedText/LinkedText.tsx';
import { ALLOWED_SAFE_DOMAINS } from '@constants/common.constants.ts';

interface WinnerBackdropWinProps {
  name: string;
}

const WinnerBackdropName = ({ name }: WinnerBackdropWinProps) => {
  return (
    <LinkedText copyable safety allowedDomains={ALLOWED_SAFE_DOMAINS}>
      {name}
    </LinkedText>
  );
};

export default WinnerBackdropName;
