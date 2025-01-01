import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TextField,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CancelIcon from '@mui/icons-material/Cancel';
import Grid2 from '@mui/material/Grid2';
import { useDispatch } from 'react-redux';

import { AucSettingsDto, SettingsPreset } from '@models/settings.model.ts';
import { normalizeLocalSettings, settingsApi } from '@api/userApi.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import './index.scss';

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

  const [presetsDropdownOpen, setPresetsDropdownOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLDivElement>(null);

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
    setPresetsDropdownOpen(false);
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
    <div className='settings-preset-fields'>
      <div ref={anchorRef} className='settings-preset-mixed-select'>
        <TextField
          className='settings-preset-name'
          value={activePresetName}
          onChange={(e) => changeActivePresetName(e.target.value)}
          label={t('settings.presets.nameFieldLabel')}
          size='medium'
        />
        <Button
          className='settings-preset-dropdown'
          variant='outlined'
          color='blank'
          onClick={() => setPresetsDropdownOpen(!presetsDropdownOpen)}
        >
          <ArrowDropDownIcon />
        </Button>
      </div>
      <Popper
        placement='bottom-end'
        sx={{ zIndex: 1 }}
        anchorEl={anchorRef.current}
        transition
        open={presetsDropdownOpen}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={() => setPresetsDropdownOpen(false)}>
                <MenuList className='settings-preset-menu'>
                  {presets.map((preset) => (
                    <Grid2 container>
                      <Grid2 size='grow'>
                        <MenuItem
                          onClick={() => onPresetClick(preset)}
                          key={preset.id}
                          className='settings-preset-menu-item'
                        >
                          {preset.name}
                        </MenuItem>
                      </Grid2>
                      <Grid2 size='auto'>
                        <IconButton
                          className='settings-preset-menu-close'
                          disabled={presets.length === 1}
                          color='error'
                          onClick={(e) => deletePreset(preset.id, e)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Grid2>
                    </Grid2>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <Button variant='outlined' onClick={createPreset}>
        {t('settings.presets.create')}
      </Button>
    </div>
  );
};

export default SettingsPresetField;
