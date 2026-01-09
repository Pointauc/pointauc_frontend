import { Text, TextProps, Tooltip } from '@mantine/core';
import clsx from 'clsx';

import styles from './index.module.css';

interface TextWithHintProps {
  children: string | React.ReactNode;
  hint?: string | React.ReactNode;
  textProps?: TextProps;
}

const TextWithHint = ({ children, hint, textProps }: TextWithHintProps) => {
  return (
    <Tooltip label={hint} disabled={!hint} position='bottom-start' withArrow multiline w={460}>
      <Text component='div' className={clsx({ [styles.hint]: hint })} {...textProps}>
        {children}
      </Text>
    </Tooltip>
  );
};

export default TextWithHint;
