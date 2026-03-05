import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, List, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useFormContext } from 'react-hook-form';

import SettingLabel from '@domains/user-settings/ui/SettingLabel';
import {
  applyStateTransfer,
  downloadStateTransferFile,
  INVALID_TRANSFER_FILE_ERROR_CODE,
  parseTransferFile,
} from '@domains/user-settings/Widgets/General/Auction/stateTransfer';
import { SettingsForm } from '@models/settings.model';

const AuctionStateTransferRow = () => {
  const { t } = useTranslation();
  const { reset, getValues } = useFormContext<SettingsForm>();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);

  const stateTransferHint = (
    <Stack gap={4}>
      <Text size='sm'>{t('settings.auc.stateTransfer.hintIntro')}</Text>
      <List size='sm' spacing={2}>
        <List.Item>{t('settings.auc.stateTransfer.hintItems.auctionTable')}</List.Item>
        <List.Item>{t('settings.auc.stateTransfer.hintItems.pendingPurchases')}</List.Item>
        <List.Item>{t('settings.auc.stateTransfer.hintItems.archive')}</List.Item>
        <List.Item>{t('settings.auc.stateTransfer.hintItems.appSettings')}</List.Item>
        <List.Item>{t('settings.auc.stateTransfer.hintItems.wheelSettings')}</List.Item>
      </List>
    </Stack>
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadStateTransferFile();
      notifications.show({
        title: t('settings.auc.stateTransfer.notifications.exportSuccess'),
        message: '',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: t('settings.auc.stateTransfer.notifications.exportError'),
        message: err instanceof Error ? err.message : t('common.error'),
        color: 'red',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setIsImporting(true);
      const parsedPayload = await parseTransferFile(file);
      await applyStateTransfer(parsedPayload);
      reset({ ...getValues(), ...parsedPayload.appSettings });
      notifications.show({
        title: t('settings.auc.stateTransfer.notifications.importSuccess'),
        message: '',
        color: 'green',
      });
    } catch (err) {
      const message =
        err instanceof Error && err.message === INVALID_TRANSFER_FILE_ERROR_CODE
          ? t('settings.auc.stateTransfer.notifications.invalidFile')
          : err instanceof Error
          ? err.message
          : t('common.error');
      notifications.show({
        title: t('settings.auc.stateTransfer.notifications.importError'),
        message,
        color: 'red',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Group align='center' className='w-full'>
      <SettingLabel text={t('settings.auc.stateTransfer.title')} hint={stateTransferHint} />
      <Group gap='xs' className='flex-wrap'>
        <Button size='sm' variant='outline' onClick={handleExport} loading={isExporting} disabled={isImporting}>
          {t('settings.auc.stateTransfer.export')}
        </Button>
        <Button size='sm' onClick={handleImportClick} loading={isImporting} disabled={isExporting}>
          {t('settings.auc.stateTransfer.import')}
        </Button>
      </Group>
      <input
        ref={fileInputRef}
        type='file'
        accept='application/json,.json'
        className='hidden'
        onChange={handleImportFile}
      />
    </Group>
  );
};

export default AuctionStateTransferRow;
