/* Deprecated: this code is not used anymore */

import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { TextField, NumberField, SwitchField } from '@shared/tanstack-form/fields';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

const formFactory = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    SwitchField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export default formFactory;
export const { useAppForm } = formFactory;
