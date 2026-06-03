import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { DeepPartial } from 'redux';
import { useSelector } from 'react-redux';
import tinycolor2 from 'tinycolor2';

import { deepMerge } from '@utils/common.utils.ts';
import { RootState } from '@reducers';

import { initialRulesSettings, RulesSettings, RulesSettingsContext } from './rulesSettingsContextData';

export interface RulesSettingsLegacy {
  size: number;
  position: 'left' | 'bottom';
  background: {
    color: string;
    opacity: number;
  };
}

const backgroundSettings = {
  ...initialRulesSettings,
  background: {
    color: '#00000026',
  },
};

export const RulesSettingsProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const background = useSelector((root: RootState) => root.aucSettings.settings.background);
  const storageSettings: RulesSettings | null = useMemo(() => {
    const fromStorage = localStorage.getItem('rulesLayout');
    if (!fromStorage) return null;

    const parsedSettings = JSON.parse(fromStorage) as RulesSettingsLegacy;

    const isLegacy = parsedSettings.background.opacity !== undefined;

    if (!isLegacy && parsedSettings.background.color.length === 7) {
      const normalizedSettings: RulesSettings = {
        size: parsedSettings.size,
        position: parsedSettings.position,
        background: {
          color: tinycolor2('#000000').setAlpha(0).toHex8String(),
        },
      };
      localStorage.setItem('rulesLayout', JSON.stringify(normalizedSettings));
      return normalizedSettings;
    }

    if (isLegacy) {
      const normalizedSettings: RulesSettings = {
        size: parsedSettings.size,
        position: parsedSettings.position,
        background: {
          color: tinycolor2(parsedSettings.background.color ?? '#000000')
            .setAlpha(parsedSettings.background.opacity ?? 0)
            .toHex8String(),
        },
      };
      localStorage.setItem('rulesLayout', JSON.stringify(normalizedSettings));
      return normalizedSettings;
    }

    return parsedSettings;
  }, []);
  const [settings, setSettings] = useState<RulesSettings>(storageSettings ?? initialRulesSettings);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (!hasChanged && !storageSettings) {
      const settings = background != null ? backgroundSettings : initialRulesSettings;
      setSettings(settings);
    }
  }, [background, hasChanged, storageSettings]);

  const mergeSettings = useCallback((settings: DeepPartial<RulesSettings>) => {
    setSettings((prevState) => {
      const newSettings = deepMerge<RulesSettings>(prevState, settings);

      localStorage.setItem('rulesLayout', JSON.stringify(newSettings));

      return newSettings;
    });
  }, []);

  const merge = useCallback((settings: DeepPartial<RulesSettings>) => {
    setHasChanged(true);
    mergeSettings(settings);
  }, [mergeSettings]);

  const value = useMemo(() => ({ data: settings, merge }), [merge, settings]);

  return <RulesSettingsContext.Provider value={value}>{children}</RulesSettingsContext.Provider>;
};
