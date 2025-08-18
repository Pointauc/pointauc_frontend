export namespace Broadcasting {
  export type DataType = 'lots' | 'timer' | 'rules' | 'wheel';

  interface DataRequestPayload {
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
    data: {
      type: 'participants-changed';
      participants: WheelParticipant[];
    };
  }

  export interface DataUpdateWheelSpinPayload {
    dataType: 'wheel';
    data: {
      type: 'spin';
      angle: number;
      duration: number;
      winner: string; // id
    };
  }

  export type DataUpdateWheelPayload = DataUpdateWheelParticipantsChangedPayload | DataUpdateWheelSpinPayload;

  export type DataUpdatePayload = DataUpdateLotsPayload | DataUpdateTimerPayload | DataUpdateWheelPayload;

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
