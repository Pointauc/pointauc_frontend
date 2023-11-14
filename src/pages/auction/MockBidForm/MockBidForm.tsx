import { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button, FormGroup } from '@mui/material';
import { useSelector } from 'react-redux';

import { Purchase } from '@reducers/Purchases/Purchases.ts';
import FormInput from '@components/Form/FormInput/FormInput';
import { RootState } from '@reducers';
import { MESSAGE_TYPES } from '@constants/webSocket.constants.ts';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';
import '@components/SettingsPage/SettingsPage.scss';
import './MockBidForm.scss';

const MockBidForm: FC = () => {
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);

  const formMethods = useForm<Partial<Purchase>>();
  const { handleSubmit, control } = formMethods;

  const onSubmit = useCallback(
    (data: Partial<Purchase>) => webSocket?.send(JSON.stringify({ type: MESSAGE_TYPES.MOCK_PURCHASE, ...data })),
    [webSocket],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='mock-bid-form settings'>
      <FormGroup row className='auc-settings-row'>
        <FormInput name='cost' label='Стоимость' control={control} type='number' className='field md' />
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <FormInput name='username' label='Username' control={control} className='field lg' />
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <FormInput name='message' label='Сообщение' control={control} className='field lg' />
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <FormSwitch name='isDonation' label='Донат' control={control} />
      </FormGroup>
      <Button type='submit' variant='contained' color='primary'>
        Отправить тестовую ставку
      </Button>
    </form>
  );
};

export default MockBidForm;
