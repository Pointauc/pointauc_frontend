import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { normalizeLocalSettings, settingsApi } from '@api/userApi.ts';
import { createPresetRecord } from '@domains/user-settings-v2/lib/presetTransfer';
import PresetTransferActions from '@domains/user-settings-v2/ui/PresetTransferActions';
import { AucSettingsDto, SettingsForm, SettingsPresetLocal } from '@models/settings.model.ts';
import { saveSettings } from '@reducers/AucSettings/AucSettings.ts';
import EditableDropdown from '@shared/ui/EditableDropdown/EditableDropdown';

const PresetEditableDropdown = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { handleSubmit, reset, getValues } = useFormContext<SettingsForm>();

  const [presets, setPresets] = useState<SettingsPresetLocal[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isCreatePresetModalOpened, setIsCreatePresetModalOpened] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isPresetTransferBusy, setIsPresetTransferBusy] = useState(false);

  useEffect(() => {
    if (!isCreatePresetModalOpened) {
      setNewPresetName('');
    }
  }, [isCreatePresetModalOpened]);

  const onSubmit = useCallback(
    (data: SettingsForm, dirtyValues: Partial<SettingsForm>) => {
      dispatch(saveSettings(dirtyValues));
      reset({ ...data, ...dirtyValues });
    },
    [dispatch, reset],
  );

  const applyPresetToForm = useCallback(
    async (presetData: AucSettingsDto) => {
      await handleSubmit((data) => onSubmit(data, presetData))();
    },
    [handleSubmit, onSubmit],
  );

  const loadPresets = useCallback(async () => {
    let nextPresets = (await settingsApi.preset.getAll()) as SettingsPresetLocal[];

    if (nextPresets.length === 0) {
      nextPresets = [
        createPresetRecord(t('settings.presets.defaultTitle'), normalizeLocalSettings(getValues()) as AucSettingsDto),
      ];
      await settingsApi.preset.setAll(nextPresets);
    }

    let nextActivePresetId = await settingsApi.preset.getActive();

    if (!nextActivePresetId || !nextPresets.some((preset) => preset.id === nextActivePresetId)) {
      nextActivePresetId = nextPresets[0]?.id ?? null;

      if (nextActivePresetId) {
        await settingsApi.preset.setActive(nextActivePresetId);
      }
    }

    setPresets(nextPresets);
    setActivePresetId(nextActivePresetId);
  }, [getValues, t]);

  useEffect(() => {
    void loadPresets();
  }, [loadPresets]);

  const handleSelectPreset = useCallback(
    async (presetId: string) => {
      if (presetId === activePresetId) {
        return;
      }

      const selectedPreset = presets.find((preset) => preset.id === presetId);

      if (!selectedPreset) {
        return;
      }

      await settingsApi.preset.setActive(presetId);
      setActivePresetId(presetId);
      await applyPresetToForm(selectedPreset.data);
    },
    [activePresetId, applyPresetToForm, presets],
  );

  const handleOpenCreatePresetModal = useCallback(() => {
    setNewPresetName('');
    setIsCreatePresetModalOpened(true);
  }, []);

  const handleCreatePreset = useCallback(async () => {
    const trimmedPresetName = newPresetName.trim();

    if (!trimmedPresetName) {
      return;
    }

    const presetData = normalizeLocalSettings(getValues()) as AucSettingsDto;
    const nextPreset = createPresetRecord(trimmedPresetName, presetData);
    const nextPresets = [...presets, nextPreset];

    await settingsApi.preset.setAll(nextPresets);
    await settingsApi.preset.setActive(nextPreset.id);
    setPresets(nextPresets);
    setActivePresetId(nextPreset.id);
    await applyPresetToForm(presetData);
    setIsCreatePresetModalOpened(false);
  }, [applyPresetToForm, getValues, newPresetName, presets]);

  const handleRenamePreset = useCallback(async (presetId: string, presetName: string) => {
    const nextPresets = await settingsApi.preset.changeName(presetId, presetName);
    setPresets(nextPresets as SettingsPresetLocal[]);
  }, []);

  const handleImportPresets = useCallback((nextPresets: SettingsPresetLocal[], nextActivePresetId: string | null) => {
    setPresets(nextPresets);
    setActivePresetId(nextActivePresetId);
  }, []);

  const handleDeletePreset = useCallback(
    async (presetId: string) => {
      if (presets.length <= 1) {
        return;
      }

      const isActivePreset = presetId === activePresetId;
      const nextPresets = presets.filter((preset) => preset.id !== presetId);
      const nextActivePreset = isActivePreset ? nextPresets[0] : presets.find((preset) => preset.id === activePresetId);

      await settingsApi.preset.delete(presetId);
      setPresets(nextPresets);

      if (nextActivePreset) {
        await settingsApi.preset.setActive(nextActivePreset.id);
        setActivePresetId(nextActivePreset.id);

        if (isActivePreset) {
          await applyPresetToForm(nextActivePreset.data);
        }
      }
    },
    [activePresetId, applyPresetToForm, presets],
  );

  const presetOptions = presets.map((preset) => ({
    value: preset.id,
    label: preset.name,
  }));

  return (
    <Stack gap='sm'>
      <EditableDropdown
        options={presetOptions}
        value={activePresetId}
        disabled={isPresetTransferBusy}
        placeholder={t('settings.website.presets.selectPlaceholder')}
        addOptionLabel={t('settings.website.presets.addNew')}
        selectedLabel={t('settings.website.presets.active')}
        editOptionLabel={t('settings.website.presets.edit')}
        deleteOptionLabel={t('common.delete')}
        submitLabel={t('common.submit')}
        revertLabel={t('common.revert')}
        onSelectOption={handleSelectPreset}
        onAddOption={handleOpenCreatePresetModal}
        onRenameOption={handleRenamePreset}
        onDeleteOption={handleDeletePreset}
      />

      <PresetTransferActions
        applyPresetToForm={applyPresetToForm}
        onImportPresets={handleImportPresets}
        onBusyChange={setIsPresetTransferBusy}
      />

      <Modal
        opened={isCreatePresetModalOpened}
        onClose={() => setIsCreatePresetModalOpened(false)}
        title={t('settings.website.presets.createModalTitle')}
        centered
      >
        <Stack gap='md'>
          <TextInput
            autoFocus
            label={t('settings.website.presets.nameLabel')}
            placeholder={t('settings.website.presets.namePlaceholder')}
            value={newPresetName}
            onChange={(event) => setNewPresetName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleCreatePreset();
              }
            }}
          />
          <Group justify='flex-end' gap='xs'>
            <Button variant='subtle' onClick={() => setIsCreatePresetModalOpened(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void handleCreatePreset()} disabled={!newPresetName.trim()}>
              {t('common.submit')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default PresetEditableDropdown;
