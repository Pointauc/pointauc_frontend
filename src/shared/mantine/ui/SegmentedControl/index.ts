import { SegmentedControl } from '@mantine/core';

import classes from './index.module.css';

const ExtendedSegmentedControl = SegmentedControl.extend({
  defaultProps: { size: 'md' },
  classNames: classes,
});

export default ExtendedSegmentedControl;
