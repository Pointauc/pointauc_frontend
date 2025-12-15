import { RulesSettingsProvider } from '@pages/auction/Rules/RulesSettingsContext';
import RulesLayout from '@pages/auction/Rules/Layout';

const Rules = () => (
  <RulesSettingsProvider>
    <RulesLayout />
  </RulesSettingsProvider>
);

export default Rules;
