import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Stack, Text, Title, Anchor, PasswordInput, Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import withLoading from '@decorators/withLoading.ts';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';

interface TokenLoginModalProps {
  opened: boolean;
  onClose: () => void;
  id: Integration.Config['id'];
  authenticate: Integration.TokenFlow['authenticate'];
}

const TokenLoginModal = ({ opened, onClose, authenticate, id }: TokenLoginModalProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [redirectConfirmationOpened, setRedirectConfirmationOpened] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authorize = async (): Promise<void> => {
    await withLoading(setIsLoading, async () => {
      await authenticate(token);
      integrationUtils.storage.set(id, 'authToken', token);
      await loadUserData(dispatch);
      onClose();
    })();
  };

  return (
    <>
      <Modal opened={opened} onClose={onClose} size='xl' centered title={t('integration.donatePay.modal.title')}>
        <Stack gap='md'>
          <Text c='dimmed'>{t('integration.donatePay.modal.description1')}</Text>

          <Text c='dimmed'>{t('integration.donatePay.modal.description2')}</Text>

          <Title order={3} ta='center'>
            {t('integration.donatePay.modal.apiKeyTitle')}
          </Title>

          <Text c='red' fw={700}>
            {t('integration.donatePay.modal.securityWarning')}
          </Text>

          <Text>
            {t('integration.donatePay.modal.instructionsPart1')}{' '}
            <Anchor onClick={() => setRedirectConfirmationOpened(true)}>https://donatepay.ru/page/api</Anchor>{' '}
            {t('integration.donatePay.modal.instructionsPart2')}
          </Text>

          <PasswordInput
            autoComplete='off'
            onChange={(e) => setToken(e.target.value)}
            value={token}
            size='md'
            placeholder={t('integration.donatePay.modal.apiKeyPlaceholder')}
          />

          <Group justify='flex-end'>
            <Button disabled={token.length === 0} variant='outline' onClick={authorize} loading={isLoading}>
              {t('integration.donatePay.modal.authorize')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={redirectConfirmationOpened}
        onClose={() => setRedirectConfirmationOpened(false)}
        centered
        size='lg'
      >
        <Stack gap='md'>
          <Title order={2}>{t('integration.donatePay.modal.hideScreenWarning')}</Title>
          <Group justify='flex-end'>
            <Button
              component='a'
              href='https://donatepay.ru/page/api'
              target='_blank'
              rel='noopener noreferrer'
              variant='outline'
              onClick={() => setRedirectConfirmationOpened(false)}
            >
              {t('integration.donatePay.modal.screenHidden')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default TokenLoginModal;
