import { TextInput } from '@mantine/core';

import classes from './index.module.css';

const ExtendedTextInput = TextInput.extend({
  classNames: classes,
});

export default ExtendedTextInput;
