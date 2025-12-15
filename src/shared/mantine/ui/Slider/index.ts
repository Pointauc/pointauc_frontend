import { Slider } from '@mantine/core';
import clsx from 'clsx';

import classes from './index.module.css';

const ExtendedSlider = Slider.extend({
  classNames: (theme, props) => ({
    ...classes,
    root: clsx({ [classes.withMarks]: props.marks, [classes.withMarkOffset]: props.marks && props.marks.length > 1 }),
  }),
});

export default ExtendedSlider;
