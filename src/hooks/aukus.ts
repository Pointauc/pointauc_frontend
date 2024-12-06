import { useSelector } from 'react-redux';

import { RootState } from '@reducers';

export const useIsAukusActive = () => {
  const { enabled } = useSelector((rootReducer: RootState) => rootReducer.aucSettings.settings.events.aukus);
  const { isValid } = useSelector((rootReducer: RootState) => rootReducer.user.events.aukus);

  return enabled && isValid;
};
