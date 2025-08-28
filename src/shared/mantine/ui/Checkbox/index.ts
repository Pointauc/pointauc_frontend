import { Checkbox as MantineCheckbox, rem } from '@mantine/core';

import styles from './index.module.css';

const sizesMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const ExtendedCheckbox = MantineCheckbox.extend({
  defaultProps: {
    size: 'md',
  },
  classNames: styles,
  vars: (theme, props) => ({
    root: {
      '--checkbox-size': rem(sizesMap[props.size as keyof typeof sizesMap]),
    },
  }),
});

export default ExtendedCheckbox;
