import { Slider } from '@mantine/core';

import classes from './index.module.css';

const ExtendedSlider = Slider.extend({
  classNames: (theme, props) => ({
    ...classes,
    root: props.marks ? classes.withMarks : undefined,
  }),
});

export default ExtendedSlider;
