import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AlertProps, AlertType } from '@models/alert.model.ts';
import { MAX_ALERTS } from '@constants/common.constants.ts';

interface NotificationsState {
  message: string | null;
  alerts: AlertType[];
}

const initialState: NotificationsState = {
  message: null,
  alerts: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotification(state, action: PayloadAction<string | null>): void {
      state.message = action.payload;
    },
    addAlert(state, action: PayloadAction<AlertProps>): void {
      const updatedAlerts = [...state.alerts, { id: Math.random(), ...action.payload }];

      // if (action.payload.duration == null) {
      //   state.alerts = updatedAlerts;
      //   return;
      // }

      let temporaryAlertsAmount = 0;
      for (let i = updatedAlerts.length - 1; i >= 0; i--) {
        temporaryAlertsAmount += updatedAlerts[i].duration === false || updatedAlerts[i].static ? 0 : 1;

        if (temporaryAlertsAmount > MAX_ALERTS) {
          updatedAlerts.splice(i, 1);

          break;
        }
      }

      state.alerts = updatedAlerts;
    },
    deleteAlert(state, action: PayloadAction<number>): void {
      state.alerts = state.alerts.filter(({ id }) => id !== action.payload);
    },
  },
});

export const { setNotification, addAlert, deleteAlert } = notificationsSlice.actions;

export default notificationsSlice.reducer;
