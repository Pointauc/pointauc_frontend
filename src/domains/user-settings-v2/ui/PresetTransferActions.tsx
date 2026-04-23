import { Button, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  applyPresetTransferPayload,
  downloadPresetTransferFile,
  INVALID_PRESET_TRANSFER_FILE_ERROR_CODE,
  parsePresetTransferFile,
} from '@domains/user-settings-v2/lib/presetTransfer';
import { AucSettingsDto, SettingsPresetLocal } from '@models/settings.model.ts';

interface PresetTransferActionsProps {
  applyPresetToForm: (presetData: AucSettingsDto) => Promise<void>;
  onImportPresets: (presets: SettingsPresetLocal[], activePresetId: string | null) => void;
  onBusyChange: (isBusy: boolean) => void;
}

const PresetTransferActions = ({ applyPresetToForm, onImportPresets, onBusyChange }: PresetTransferActionsProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImportPresetFile = useCallback(
    async (file: File) => {
      setIsImporting(true);
      onBusyChange(true);

      try {
        const payload = await parsePresetTransferFile(file);
        await applyPresetTransferPayload(payload);

        const nextActivePresetId =
          payload.activePresetId && payload.presets.some((preset) => preset.id === payload.activePresetId)
            ? payload.activePresetId
            : payload.presets[0].id;

        const selectedPreset = payload.presets.find((preset) => preset.id === nextActivePresetId);

        onImportPresets(payload.presets, nextActivePresetId);

        if (selectedPreset) {
          await applyPresetToForm(selectedPreset.data);
        }

        notifications.show({
          title: t('settings.website.presets.notifications.importSuccess'),
          message: '',
          color: 'green',
        });
      } catch (err) {
        const message =
          err instanceof Error && err.message === INVALID_PRESET_TRANSFER_FILE_ERROR_CODE
            ? t('settings.website.presets.notifications.invalidFile')
            : err instanceof Error
            ? err.message
            : t('common.error');

        notifications.show({
          title: t('settings.website.presets.notifications.importError'),
          message,
          color: 'red',
        });
      } finally {
        setIsImporting(false);
        onBusyChange(false);
      }
    },
    [applyPresetToForm, onBusyChange, onImportPresets, t],
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const [file] = event.target.files ?? [];
      event.target.value = '';

      if (!file) {
        return;
      }

      await handleImportPresetFile(file);
    },
    [handleImportPresetFile],
  );

  const handleExportPresets = useCallback(async () => {
    setIsExporting(true);
    onBusyChange(true);

    try {
      await downloadPresetTransferFile();
      notifications.show({
        title: t('settings.website.presets.notifications.exportSuccess'),
        message: '',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: t('settings.website.presets.notifications.exportError'),
        message: err instanceof Error ? err.message : t('common.error'),
        color: 'red',
      });
    } finally {
      setIsExporting(false);
      onBusyChange(false);
    }
  }, [onBusyChange, t]);

  return (
    <SimpleGrid cols={2} spacing='xs' className='w-full'>
      <Button variant='outline' onClick={handleExportPresets} loading={isExporting} disabled={isImporting} size='sm'>
        {t('settings.website.presets.export')}
      </Button>
      <Button onClick={handleImportClick} loading={isImporting} disabled={isExporting} size='sm'>
        {t('settings.website.presets.import')}
      </Button>

      <input
        ref={fileInputRef}
        type='file'
        accept='application/json,.json'
        hidden
        onChange={handleImportFileChange}
      />
    </SimpleGrid>
  );
};

export default PresetTransferActions;
