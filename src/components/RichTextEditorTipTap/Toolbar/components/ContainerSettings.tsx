import React, { useContext } from 'react';
import { Box, Grid, IconButton, Popover, PopoverProps, Slider } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

import { RulesSettingsContext } from '@pages/auction/Rules/RulesSettingsContext.tsx';
import ColorPicker from '@components/Form/ColorPicker/ColorPicker.tsx';

import './ContainerSettings.scss';

const ContainerSettings = () => {
  const { t } = useTranslation();
  const {
    data: { size, position, background },
    merge,
  } = useContext(RulesSettingsContext);
  const [anchorEl, setAnchorEl] = React.useState<PopoverProps['anchorEl']>();
  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    setAnchorEl({
      nodeType: 1,
      getBoundingClientRect: () => rect,
    });
  };

  return (
    <>
      <div className='rules-container-settings'>
        <IconButton onClick={openMenu}>
          <SettingsIcon />
        </IconButton>
        <Popover
          open={!!anchorEl}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          className='rules-container-settings__popover'
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box width={290}>
            <Grid p={2} container direction='column' gap={1}>
              <Grid item container xs={12} gap={2} alignItems='center' wrap={'nowrap'}>
                <div>{t('rules.background')}</div>
                <Grid item flexShrink={0}>
                  <ColorPicker value={background.color} onChange={(color) => merge({ background: { color } })} />
                </Grid>
                <Slider
                  value={background.opacity}
                  onChange={(_, value) => merge({ background: { opacity: value as number } })}
                  max={0.8}
                  min={0}
                  step={0.05}
                />
              </Grid>
              <Grid item container xs={12} gap={2} alignItems='center' wrap={'nowrap'}>
                <div>{t('rules.size')}</div>
                <Slider
                  value={size}
                  onChange={(_, value) => merge({ size: value as number })}
                  max={700}
                  min={220}
                  step={10}
                />
              </Grid>
            </Grid>
          </Box>
        </Popover>
      </div>
    </>
  );
};

export default ContainerSettings;
