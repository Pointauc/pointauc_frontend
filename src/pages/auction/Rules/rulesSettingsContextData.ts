import { createContext } from 'react';
import { DeepPartial } from 'redux';

export interface RulesSettings {
  size: number;
  position: 'left' | 'bottom';
  background: {
    color: string;
  };
}

interface RulesContextData {
  data: RulesSettings;
  merge: (settings: DeepPartial<RulesSettings>) => void;
}

export const initialRulesSettings: RulesSettings = {
  size: 380,
  position: 'left',
  background: {
    color: '#00000000',
  },
};

export const RulesSettingsContext = createContext<RulesContextData>({
  data: initialRulesSettings,
  merge: () => {},
});
