import { FC, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Container, Loader, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

import { RootState } from '@reducers/index';
import ROUTES from '@constants/routes.constants';
import { exportBrowserData } from '@domains/desktop/lib/exportBrowserData';
import { requestStoragePersistence } from '@shared/lib/storage/persistStorage';

import { uploadRecoveryData } from '../../api/recoveryApi';

export const RecoveryView: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const executeRecovery = useCallback(async () => {
    setStatus('loading');
    try {
      await requestStoragePersistence();
      const dataPayload = await exportBrowserData();

      const parsedUserId = user?.pointaucUserId
        ? Number(user.pointaucUserId)
        : user?.userId && !Number.isNaN(Number(user.userId))
          ? Number(user.userId)
          : undefined;

      await uploadRecoveryData({
        userId: parsedUserId,
        data: dataPayload,
      });

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [user]);

  useEffect(() => {
    executeRecovery();
  }, [executeRecovery]);

  return (
    <Container size="xs" className="flex items-center justify-center min-h-[60vh]">
      <Paper withBorder radius="md" p="xl" className="w-full text-center bg-zinc-900 border-zinc-800">
        <Stack align="center" gap="md">
          {status === 'loading' && (
            <>
              <Loader color="violet" size="md" />
              <Text size="sm" c="dimmed">
                {t('recovery.loading', 'Saving data...')}
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <ThemeIcon size={48} radius="xl" color="teal" variant="light">
                <IconCheck size={28} />
              </ThemeIcon>
              <Text size="sm" fw={500} className="text-zinc-100">
                {t('recovery.success', 'Data saved successfully.')}
              </Text>
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                mt="xs"
                onClick={() => navigate(ROUTES.HOME)}
              >
                {t('recovery.backHome', 'Back to Home')}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <ThemeIcon size={48} radius="xl" color="red" variant="light">
                <IconAlertCircle size={28} />
              </ThemeIcon>
              <Text size="sm" c="red.4">
                {t('recovery.error', 'Failed to save data. Please try again.')}
              </Text>
              <Button
                variant="light"
                color="violet"
                size="xs"
                mt="xs"
                onClick={executeRecovery}
              >
                {t('recovery.retry', 'Try again')}
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};
