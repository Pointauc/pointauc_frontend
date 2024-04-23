import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { DeepPartial } from 'redux';
import { useSelector } from 'react-redux';

import { deepMerge } from '@utils/common.utils.ts';
import { RootState } from '@reducers';

export interface RulesSettings {
  size: number;
  position: 'left' | 'bottom';
  background: {
    color: string;
    opacity: number;
  };
}

interface RulesContextData {
  data: RulesSettings;
  merge: (settings: DeepPartial<RulesSettings>) => void;
}

const initialSettings: RulesSettings = {
  size: 380,
  position: 'left',
  background: {
    color: '#000000',
    opacity: 0,
  },
};

const backgroundSettings = {
  ...initialSettings,
  background: {
    color: '#000000',
    opacity: 0.15,
  },
};

export const RulesSettingsContext = createContext<RulesContextData>({ data: initialSettings, merge: () => {} });

export const RulesSettingsProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const background = useSelector((root: RootState) => root.aucSettings.settings.background);
  const storageSettings = useMemo(() => {
    const fromStorage = localStorage.getItem('rulesLayout');

    return fromStorage ? JSON.parse(fromStorage) : null;
  }, []);
  const [settings, setSettings] = useState<RulesSettings>(storageSettings ?? initialSettings);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (!hasChanged && !storageSettings) {
      const settings = background != null ? backgroundSettings : initialSettings;
      setSettings(settings);
    }
  }, [background, hasChanged, storageSettings]);

  const _merge = (settings: DeepPartial<RulesSettings>) => {
    setSettings((prevState) => {
      const newSettings = deepMerge<RulesSettings>(prevState, settings);

      localStorage.setItem('rulesLayout', JSON.stringify(newSettings));

      return newSettings;
    });
  };

  const merge = (settings: DeepPartial<RulesSettings>) => {
    setHasChanged(true);
    _merge(settings);
  };

  const value = useMemo(() => ({ data: settings, merge }), [settings]);

  return <RulesSettingsContext.Provider value={value}>{children}</RulesSettingsContext.Provider>;
};
