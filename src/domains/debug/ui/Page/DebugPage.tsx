import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Container, Stack, Text, Title, Paper, Alert } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

import { RootState } from '@reducers/index';

import classes from './DebugPage.module.css';

const DebugPage = () => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const userId = useSelector((root: RootState) => root.user.pointaucUserId);
  const username = useSelector((root: RootState) => root.user.username);

  const handleCopyUserId = async () => {
    if (!userId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(`pointauc-debug-string:${userId}`);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy user ID:', err);
    }
  };

  return (
    <Container size='sm' className={classes.container}>
      <Stack gap='xl' align='center'>
        <Title order={1} className={classes.title}>
          {t('debug.title')}
        </Title>

        <Paper shadow='sm' p='xl' radius='md' withBorder className={classes.paper}>
          <Stack gap='lg' align='center'>
            {!isCopied ? (
              <>
                <Text size='lg' ta='center' className={classes.instruction}>
                  <Trans i18nKey='debug.step1' components={{ strong: <strong /> }} />
                </Text>

                <Button
                  size='xl'
                  leftSection={<IconCopy size={24} />}
                  onClick={handleCopyUserId}
                  disabled={!userId}
                  className={classes.copyButton}
                  variant='filled'
                >
                  {t('debug.copyButton')}
                </Button>

                {userId && (
                  <Text size='sm' c='dimmed' ta='center'>
                    {t('debug.user', { username: username || 'Unknown' })}
                  </Text>
                )}

                {!userId && (
                  <Alert color='yellow' title={t('debug.noUserId')} variant='light'>
                    {t('debug.noUserIdMessage')}
                  </Alert>
                )}
              </>
            ) : (
              <>
                <Alert
                  icon={<IconCheck size={20} />}
                  title={t('debug.copiedTitle')}
                  color='green'
                  variant='light'
                  className={classes.successAlert}
                />

                <Text size='lg' ta='center' className={classes.instruction}>
                  <Trans i18nKey='debug.step2' components={{ strong: <strong /> }} />
                </Text>

                <Text size='sm' c='dimmed' ta='center' mt='md'>
                  {t('debug.pasteInstructions')}
                </Text>
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default DebugPage;
