import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Purchase, processRedemption } from '@reducers/Purchases/Purchases.ts';
import { useAppForm } from '@shared/tanstack-form/lib/form';

export interface MockBidFormData extends Purchase {
  randomValues: boolean;
}

export const defaultMockBidData: MockBidFormData = {
  cost: 100,
  username: 'test',
  message: 'test',
  isDonation: false,
  timestamp: new Date().toISOString(),
  color: '#000000',
  id: '1',
  source: 'Mock',
  randomValues: true,
};

/** Hook that creates and manages the mock bid form state. */
export const useMockBidForm = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  return useAppForm({
    defaultValues: defaultMockBidData,
    onSubmit: ({ value }) => {
      const { randomValues, ...rest } = value;
      const baseBid = { ...rest, timestamp: new Date().toISOString() };
      if (randomValues) {
        dispatch(
          processRedemption({
            ...baseBid,
            id: Math.random().toString(),
            cost: Math.floor(Math.random() * 1000),
            message: `Random message ${Math.random().toString(36).substring(7)}`,
            username: `User_${Math.random().toString(36).substring(7)}`,
          }),
        );
      } else {
        dispatch(processRedemption({ ...baseBid, id: Math.random().toString() }));
      }
    },
  });
};

export type MockBidFormInstance = ReturnType<typeof useMockBidForm>;
