import { Text, Tooltip } from '@mantine/core';
import clsx from 'clsx';

import styles from './index.module.css';

interface TextWithHintProps {
  children: string | React.ReactNode;
  hint?: string | React.ReactNode;
}

const TextWithHint = ({ children, hint }: TextWithHintProps) => {
  return (
    <Tooltip label={hint} disabled={!hint} position='bottom-start' withArrow multiline w={460}>
      <Text component='div' className={clsx({ [styles.hint]: hint })}>
        {children}
      </Text>
    </Tooltip>
  );
};

export default TextWithHint;
