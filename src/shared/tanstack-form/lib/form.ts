import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

const { fieldContext, formContext } = createFormHookContexts();

const formFactory = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
});

export default formFactory;
export const { useAppForm } = formFactory;
