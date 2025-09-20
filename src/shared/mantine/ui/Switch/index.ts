import { Switch } from '@mantine/core';

import classes from './index.module.css';

const ExtendedSwitch = Switch.extend({
  classNames: classes,
  defaultProps: {
    size: 'md',
    labelPosition: 'left',
  },
});

export default ExtendedSwitch;
