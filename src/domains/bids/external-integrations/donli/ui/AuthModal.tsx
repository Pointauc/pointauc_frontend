import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Anchor, Button, Divider, Modal, PasswordInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import withLoading from '@decorators/withLoading';
import { loadUserData } from '@reducers/AucSettings/AucSettings';
import { donliControllerAuthorizeToken } from '@api/openapi';
import { createDonliAuthorizeUrl } from '../lib/auth';
import { saveRedirectReturnPath } from '@domains/bids/external-integrations/shared/auth/redirect/redirectReturnPath';
import { startIntegrationLogin } from '@shared/lib/desktop/startIntegrationLogin';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
  clientId?: string;
  redirectUri: string;
}

export function DonliAuthModal({ opened, onClose, clientId, redirectUri }: AuthModalProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setToken('');
    onClose();
  };

  const handleAuthorizeWithToken = async () => {
    if (!token.trim()) return;

    await withLoading(setIsLoading, async () => {
      try {
        await donliControllerAuthorizeToken({ body: { accessToken: token.trim() } });
        await dispatch(loadUserData());
        handleClose();
      } catch (err) {
        notifications.show({
          title: t('common.authError', 'Ошибка авторизации'),
          message: t('integration.donli.authModal.invalidToken', 'Неверный ключ Donli или ошибка соединения'),
          color: 'red',
          autoClose: 10000,
          withCloseButton: true,
        });
      }
    })();
  };

  const handleOAuthLogin = async () => {
    if (!clientId) return;
    saveRedirectReturnPath('donli');
    const authUrl = await createDonliAuthorizeUrl(clientId, redirectUri);
    startIntegrationLogin('donli', authUrl);
  };

  return (
    <Modal opened={opened} onClose={handleClose} size='md' title={t('integration.donli.authModal.title', 'Подключение ДОНЛИ')}>
      <Stack gap='md'>
        {clientId && (
          <>
            <Button
              onClick={handleOAuthLogin}
              style={{ background: 'linear-gradient(135deg, #fb426b, #ff8d5d)', color: '#ffffff' }}
              fullWidth
            >
              {t('integration.donli.authModal.oauthButton', 'Войти через Donli (OAuth 2.0)')}
            </Button>
            <Divider label={t('common.or', 'или')} labelPosition='center' />
          </>
        )}

        <Stack gap='xs'>
          <Text size='sm'>
            {t(
              'integration.donli.authModal.cabinetKeyDescription',
              'Вставьте ключ из личного кабинета Donli (раздел «Настройки» → «Интеграция»):',
            )}
          </Text>
          <PasswordInput
            placeholder='donli_...'
            value={token}
            onChange={(e) => setToken(e.currentTarget.value)}
            disabled={isLoading}
          />
          <Text size='xs' c='dimmed'>
            <Anchor href='https://donli.gg' target='_blank' rel='noopener noreferrer'>
              {t('integration.donli.authModal.openCabinet', 'Перейти на сайт Donli ↗')}
            </Anchor>
          </Text>
        </Stack>

        <Button
          onClick={handleAuthorizeWithToken}
          disabled={!token.trim()}
          loading={isLoading}
          fullWidth
        >
          {t('common.save', 'Сохранить')}
        </Button>
      </Stack>
    </Modal>
  );
}

export default DonliAuthModal;
