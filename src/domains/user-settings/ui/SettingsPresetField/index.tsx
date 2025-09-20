import React, { useEffect, useState, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { Button, ActionIcon, Menu, Group, Text } from '@mantine/core';
import { IconChevronDown, IconX, IconSquareRoundedPlusFilled, IconCheck } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';

import { AucSettingsDto, SettingsPreset } from '@models/settings.model.ts';
import { normalizeLocalSettings, settingsApi } from '@api/userApi.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { OutlineInput } from '@shared/mantine/ui/Input';

import classes from './index.module.css';

interface Props {
  onChange: (value: AucSettingsDto) => void;
  allSettings: AucSettingsDto;
}

const SettingsPresetField = ({ onChange, allSettings }: Props) => {
  const { t } = useTranslation();
  const [activePresetId, setActivePresetId] = useState<string>();
  const [presets, setPresets] = useState<SettingsPreset[]>([]);
  const [activePresetName, setActivePresetName] = useState<string>('');
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      let presets = await settingsApi.preset.getAll();

      if (presets.length === 0) {
        const newPresets = [
          { id: uuidv4(), name: t('settings.presets.defaultTitle'), data: normalizeLocalSettings(allSettings) as any },
        ];
        presets = newPresets;

        await settingsApi.preset.setAll(newPresets);
      }

      setPresets(presets);
      let activePreset = await settingsApi.preset.getActive();

      if (!activePreset || !presets.find((preset) => preset.id === activePreset)) {
        activePreset = presets[0].id;
        await settingsApi.preset.setActive(activePreset);
      }

      setActivePresetId(activePreset);
      setActivePresetName(presets.find((preset) => preset.id === activePreset)?.name ?? '');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [_, startTransition] = useTransition();
  const changeActivePresetName = (name: string) => {
    setActivePresetName(name);
    startTransition(() => {
      settingsApi.preset.changeName(activePresetId!, name).then(setPresets);
    });
  };

  const selectPreset = async ({ id, name }: SettingsPreset) => {
    if (id !== activePresetId) {
      setActivePresetId(id);

      setActivePresetName(name);

      await settingsApi.preset.setActive(id);

      const data = await settingsApi.preset.getData(id);
      data && onChange(data);
    }
  };

  const onPresetClick = (preset: SettingsPreset) => {
    selectPreset(preset);
  };

  const createPreset = async () => {
    const newPreset = await settingsApi.preset.create(allSettings);
    setPresets([...presets, newPreset]);
    selectPreset(newPreset);
    dispatch(addAlert({ message: t('settings.presets.created'), type: AlertTypeEnum.Success }));
  };

  const deletePreset = async (id: string, event: React.SyntheticEvent) => {
    event.stopPropagation();

    if (id === activePresetId) {
      if (presets.length > 1) {
        const firstAvailablePreset = presets.find((preset) => preset.id !== id)!;
        selectPreset(firstAvailablePreset);
      } else {
        return;
      }
    }

    await settingsApi.preset.delete(id);
    setPresets(presets.filter((preset) => preset.id !== id));
  };

  return (
    <div className={classes.settingsPresetFields}>
      <Group>
        <OutlineInput
          className={classes.settingsPresetName}
          value={activePresetName}
          onChange={(e) => changeActivePresetName(e.currentTarget.value)}
          label={t('settings.presets.nameFieldLabel')}
        />
        <Menu position='bottom-end' width={350} classNames={{ itemSection: classes.menuItemSection }}>
          <Menu.Target>
            <Button variant='outline' rightSection={<IconChevronDown />}>
              {t('settings.presets.switchPreset')}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => createPreset()}>
              <Group justify='center' gap='xs'>
                <IconSquareRoundedPlusFilled />
                <Text>{t('settings.presets.create')}</Text>
              </Group>
            </Menu.Item>
            {presets.map((preset) => (
              <Group key={preset.id} justify='space-between' gap='xxs'>
                <Menu.Item
                  onClick={() => onPresetClick(preset)}
                  style={{ flex: 1 }}
                  leftSection={activePresetId === preset.id ? <IconCheck size={20} /> : null}
                >
                  {preset.name}
                </Menu.Item>
                <ActionIcon
                  disabled={presets.length === 1}
                  color='red'
                  variant='subtle'
                  size='lg'
                  onClick={(e) => deletePreset(preset.id, e)}
                >
                  <IconX />
                </ActionIcon>
              </Group>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </div>
  );
};

export default SettingsPresetField;
