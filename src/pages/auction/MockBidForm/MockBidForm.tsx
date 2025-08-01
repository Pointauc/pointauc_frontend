import { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, FormGroup } from '@mui/material';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';
import FormInput from '@components/Form/FormInput/FormInput';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';

import './MockBidForm.scss';

const defaultPurchase: MockBidFormData = {
  cost: 100,
  username: 'test',
  message: 'test',
  isDonation: false,
  timestamp: new Date().toISOString(),
  color: '#000000',
  id: '1',
  source: 'Mock',
  randomValues: true,
};

interface MockBidFormData extends Purchase {
  randomValues: boolean;
}

const MockBidForm: FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const formMethods = useForm<MockBidFormData>({ defaultValues: defaultPurchase });
  const { handleSubmit, control } = formMethods;

  const onSubmit = useCallback(
    (data: MockBidFormData) => {
      const { randomValues, ...rest } = data;
      if (randomValues) {
        dispatch(
          processRedemption({
            ...rest,
            id: Math.random().toString(),
            cost: Math.floor(Math.random() * 1000),
            message: 'Random message ' + Math.random().toString(),
            username: 'Random username' + Math.random().toString(),
          }),
        );
      } else {
        dispatch(processRedemption({ ...rest, id: Math.random().toString() }));
      }
    },
    [dispatch],
  );

  return (
    <Box sx={{ p: 2 }}>
      <form className='mock-bid-form' onSubmit={handleSubmit(onSubmit)}>
        <FormGroup row className='auc-settings-row'>
          <FormInput name='cost' label='Cost' control={control} type='number' className='field md' />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormInput name='username' label='Username' control={control} className='field lg' />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormInput name='message' label='Message' control={control} className='field lg' />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='isDonation' label='Is donation' control={control} />
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='randomValues' label='Random values' control={control} />
        </FormGroup>
        <Button type='submit' variant='contained' color='primary'>
          Send
        </Button>
      </form>
    </Box>
  );
};

export default MockBidForm;
