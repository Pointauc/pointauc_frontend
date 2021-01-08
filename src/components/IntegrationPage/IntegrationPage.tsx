import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Button } from '@material-ui/core';
import PageContainer from '../PageContainer/PageContainer';
import TwitchIntegration from './TwitchIntegration/TwitchIntegration';
import { RootState } from '../../reducers';
import { IntegrationFields, setIntegration } from '../../reducers/AucSettings/AucSettings';
import LoadingButton from '../LoadingButton/LoadingButton';
import withLoading from '../../decorators/withLoading';
import { updateIntegration } from '../../api/userApi';
import DaIntegration from './DAIntegration/DAIntegration';

const IntegrationPage: FC = () => {
  const dispatch = useDispatch();
  const { integration } = useSelector((root: RootState) => root.aucSettings);
  const { username } = useSelector((root: RootState) => root.user);
  const formMethods = useForm<IntegrationFields>({ defaultValues: integration });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = formMethods;

  useEffect(() => {
    reset(integration);
  }, [reset, integration]);

  const handleReset = useCallback(() => reset(), [reset]);
  const onSubmit = useCallback(
    (data) =>
      withLoading(setIsSubmitting, async () => {
        if (username) {
          await updateIntegration(data);
        }

        return dispatch(setIntegration(data));
      })(),
    [dispatch, username],
  );

  return (
    <PageContainer title="Интеграции">
      <form className="settings" onSubmit={handleSubmit(onSubmit)}>
        <TwitchIntegration control={control} />
        <DaIntegration control={control} />
        <div style={{ marginTop: 40 }}>
          <LoadingButton
            isLoading={isSubmitting}
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginRight: 20 }}
            disabled={!isDirty || isSubmitting}
          >
            Применить
          </LoadingButton>
          <Button onClick={handleReset} variant="outlined" disabled={!isDirty || isSubmitting}>
            Отменить
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};

export default IntegrationPage;
