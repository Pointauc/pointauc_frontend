import { TextInput } from '@mantine/core';

import OutlineInput from './Outline/OutlineInput';

const ExtendedTextInput = TextInput.extend({
  defaultProps: {
    size: 'md',
    rightSectionPointerEvents: 'none',
  },
});

export default ExtendedTextInput;
export { OutlineInput };
