import { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, FormGroup } from '@mui/material';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';
import FormInput from '@components/Form/FormInput/FormInput';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';

import './MockBidForm.scss';

const defaultPurchase: Purchase = {
  cost: 100,
  username: 'test',
  message: 'test',
  isDonation: false,
  timestamp: new Date().toISOString(),
  color: '#000000',
  id: '1',
  source: 'Mock',
};

const MockBidForm: FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const formMethods = useForm<Purchase>({ defaultValues: defaultPurchase });
  const { handleSubmit, control } = formMethods;

  const onSubmit = useCallback(
    (data: Purchase) => dispatch(processRedemption({ ...data, id: Math.random().toString() })),
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
        <Button type='submit' variant='contained' color='primary'>
          Send
        </Button>
      </form>
    </Box>
  );
};

export default MockBidForm;
