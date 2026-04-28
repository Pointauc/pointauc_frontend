import { ManagerOptions, SocketOptions } from 'socket.io-client';
export const SOCKET_IO_RECONNECT_DELAYS = {
  default: {
    reconnectionDelay: 1500,
    reconnectionDelayMax: 20000,
  },
  overlay: {
    reconnectionDelay: 5000,
    reconnectionDelayMax: 25000,
  },
} as const;

type SocketIoConnectionKind = keyof typeof SOCKET_IO_RECONNECT_DELAYS;

type SocketIoOptionsInput = {
  query?: Record<string, unknown>;
  auth?: Record<string, unknown>;
};

export const buildSocketIoOptions = (
  kind: SocketIoConnectionKind,
  options: SocketIoOptionsInput = {},
): Partial<ManagerOptions & SocketOptions> => {
  const reconnectDelays = SOCKET_IO_RECONNECT_DELAYS[kind];

  return {
    ...options,
    transports: ['websocket'],
    ...reconnectDelays,
  };
};
