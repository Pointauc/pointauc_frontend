import { WheelParticipantsChangedDto, WheelSettingsChangedDto, WheelSpinDto } from '@api/openapi/types.gen';

export namespace Broadcasting {
  export type DataType = 'lots' | 'timer' | 'rules' | 'wheel';

  export interface DataRequestPayload {
    dataType: DataType;
    timestamp: string;
  }

  export interface DataUpdateLotsPayload {
    dataType: 'lots';
    data: {
      fastId: number;
      id: string;
      name: string;
      amount: number;
    }[];
  }

  export interface DataUpdateTimerPayload {
    dataType: 'timer';
    data: {
      state: 'paused' | 'running';
      timeLeft: number;
    };
  }

  export interface WheelParticipant {
    name: string;
    id: string;
    color: string;
    amount: number;
  }

  export interface DataUpdateWheelParticipantsChangedPayload {
    dataType: 'wheel';
    data: WheelParticipantsChangedDto;
  }

  export interface DataUpdateWheelSpinPayload {
    dataType: 'wheel';
    data: WheelSpinDto;
  }

  export interface DataUpdateWheelSettingsChangedPayload {
    dataType: 'wheel';
    data: WheelSettingsChangedDto;
  }

  export type DataUpdateWheelPayload =
    | DataUpdateWheelParticipantsChangedPayload
    | DataUpdateWheelSpinPayload
    | DataUpdateWheelSettingsChangedPayload;

  export interface DataUpdateRulesPayload {
    dataType: 'rules';
    data: {
      text: string;
    };
  }

  export type DataUpdatePayload =
    | DataUpdateLotsPayload
    | DataUpdateTimerPayload
    | DataUpdateWheelPayload
    | DataUpdateRulesPayload;

  export interface ListenEvents {
    updatesRequested: (data: DataRequestPayload) => void;
    updatesSilenced: (data: DataRequestPayload) => void;
    dataUpdate: (data: DataUpdatePayload) => void;
  }

  export interface EmitEvents {
    listen: (dataType: DataType[]) => void;
    unlisten: (dataType: DataType[]) => void;
  }
}
