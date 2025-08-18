import { TextInputVariant } from '@mantine/core';

declare module '@mantine/core' {
  export interface TextInputProps {
    variant?: TextInputVariant | 'outline';
  }
}
