import { forwardRef, useState, type FocusEvent } from 'react';
import { TextInput, TextInputProps } from '@mantine/core';
import clsx from 'clsx';

import classes from './OutlineInput.module.css';

export interface OutlineInputProps extends Omit<TextInputProps, 'variant'> {
  label?: string;
}

const OutlineInput = forwardRef<HTMLInputElement, OutlineInputProps>(
  ({ label, className, onFocus, onBlur, classNames, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue =
      props.value !== undefined
        ? props.value !== ''
        : props.defaultValue !== undefined && String(props.defaultValue) !== '';

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const shouldElevate = hasValue || isFocused;

    const composedClassNames: TextInputProps['classNames'] = (theme, p, ctx) => {
      const base = typeof classNames === 'function' ? classNames(theme, p, ctx) : classNames || {};
      return {
        ...base,
        input: clsx(classes.input, base.input),
      };
    };

    return (
      <fieldset className={clsx(classes.fieldset, className)}>
        {label && (
          <>
            {/* Invisible legend controls the notch width without adding background */}
            <legend className={clsx(classes.legend, { [classes.legendNotched]: shouldElevate })} aria-hidden='true'>
              <span className={classes.legendLabel}>{label}</span>
            </legend>
            {/* Visible floating label (no background) */}
            <span className={clsx(classes.floatingLabel, { [classes.floatingLabelElevated]: shouldElevate })}>
              {label}
            </span>
          </>
        )}
        <TextInput
          {...props}
          ref={ref}
          label={undefined}
          classNames={composedClassNames}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </fieldset>
    );
  },
);

OutlineInput.displayName = 'OutlineInput';

export default OutlineInput;
