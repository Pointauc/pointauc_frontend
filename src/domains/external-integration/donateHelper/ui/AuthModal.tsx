import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Anchor, Button, Group, Image, Modal, PasswordInput, Stack, Stepper, Text, Title } from '@mantine/core';

import withLoading from '@decorators/withLoading.ts';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { donateHelperControllerAuthorize } from '@api/openapi/sdk.gen.ts';
import authGuide1 from '@assets/img/donate-helper-auth-guide-1.jpg';
import authGuide2 from '@assets/img/donate-helper-auth-guide-2.jpg';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

function AuthModal({ opened, onClose }: AuthModalProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setToken('');
    onClose();
  };

  const handleAuthorize = async () => {
    if (!token) return;

    await withLoading(setIsLoading, async () => {
      await donateHelperControllerAuthorize({ body: { accessToken: token } });
      integrationUtils.storage.set('donateHelper', 'authToken', token);
      await loadUserData(dispatch);
      handleClose();
    })();
  };

  return (
    <Modal opened={opened} onClose={handleClose} size='lg' title={t('integration.donateHelper.authModal.title')}>
      <Stack gap='lg'>
        <Stepper active={-1} orientation='vertical' size='sm'>
          <Stepper.Step
            label={
              <Text size='lg' fw={500}>
                {t('integration.donateHelper.authModal.steps.navigate')}
              </Text>
            }
            description={
              <Trans
                i18nKey='integration.donateHelper.authModal.instructions.navigate'
                components={{ 1: <Anchor href='https://donatehelper.com/dashboard/account?tab=api' target='_blank' /> }}
              />
            }
          />
          <Stepper.Step
            label={
              <Text size='lg' fw={500}>
                {t('integration.donateHelper.authModal.steps.createToken')}
              </Text>
            }
            description={<Image src={authGuide1} h={140} w='auto' alt='Create token guide' radius='md' />}
          />
          <Stepper.Step
            label={
              <Text size='lg' fw={500}>
                {t('integration.donateHelper.authModal.steps.copyToken')}
              </Text>
            }
            description={<Image src={authGuide2} h={120} w='auto' alt='Copy token guide' radius='md' />}
          ></Stepper.Step>
        </Stepper>

        <PasswordInput
          size='md'
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t('integration.donateHelper.authModal.tokenPlaceholder')}
          autoComplete='off'
        />

        <Group justify='flex-end'>
          <Button variant='default' onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAuthorize} loading={isLoading} disabled={!token}>
            {t('integration.donateHelper.authModal.submit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default AuthModal;
