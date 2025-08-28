import { TextInput } from '@mantine/core';

import OutlineInput from './OutlineInput';

const ExtendedTextInput = TextInput.extend({
  defaultProps: {
    size: 'md',
  },
});

export default ExtendedTextInput;
export { OutlineInput };
