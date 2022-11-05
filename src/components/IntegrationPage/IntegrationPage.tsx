import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeepPartial, useForm } from 'react-hook-form';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import PageContainer from '../PageContainer/PageContainer';
import TwitchIntegration from './TwitchIntegration/TwitchIntegration';
import { RootState } from '../../reducers';
import { initialState, IntegrationFields, setIntegration } from '../../reducers/AucSettings/AucSettings';
import LoadingButton from '../LoadingButton/LoadingButton';
import withLoading from '../../decorators/withLoading';
import { updateIntegration } from '../../api/userApi';
import DaIntegration from './DAIntegration/DAIntegration';
import { getDirtyValues } from '../../utils/common.utils';
import ConfirmFormOnLeave from '../ConfirmFormOnLeave/ConfirmFormOnLeave';

const IntegrationPage: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { integration } = useSelector((root: RootState) => root.aucSettings);
  const { username } = useSelector((root: RootState) => root.user);
  const formMethods = useForm<IntegrationFields>({ defaultValues: integration });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields },
    reset,
  } = formMethods;
  const { twitch: twitchDirty, da: daDirty } = dirtyFields;

  useEffect(() => {
    reset(integration);
  }, [reset, integration]);

  const getDirtyIntegration = useCallback(
    ({ twitch, da }: IntegrationFields): DeepPartial<IntegrationFields> => ({
      twitch: getDirtyValues(twitch, twitchDirty, initialState.integration.twitch),
      da: getDirtyValues(da, daDirty, initialState.integration.da),
    }),
    [daDirty, twitchDirty],
  );

  const handleReset = useCallback(() => reset(), [reset]);
  const onSubmit = useCallback(
    (data) =>
      withLoading(setIsSubmitting, async () => {
        dispatch(setIntegration(data));

        if (username) {
          await updateIntegration(getDirtyIntegration(data));
        }
      })(),
    [dispatch, getDirtyIntegration, username],
  );

  return (
    <PageContainer title={t('settings.integrations')}>
      <form className="settings" onSubmit={handleSubmit(onSubmit)}>
        <ConfirmFormOnLeave isDirtyForm={isDirty} onSubmit={handleSubmit(onSubmit)} />
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
            {t('common.apply')}
          </LoadingButton>
          <Button onClick={handleReset} variant="outlined" disabled={!isDirty || isSubmitting}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};

export default IntegrationPage;
