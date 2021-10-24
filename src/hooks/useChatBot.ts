import { ChatUserstate, Client } from 'tmi.js';
import { useEffect, useMemo, useState } from 'react';

interface ChatBotResult {
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  loading: boolean;
}

export const useChatBot = (
  channel: string,
  command: string,
  onCommand: (user: ChatUserstate, payload?: string) => void,
): ChatBotResult => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setIsLoading] = useState<boolean>(false);
  const client = useMemo(
    () =>
      new Client({
        identity: {
          username: 'skipsome_bot',
          password: 'oauth:x5mb08s1lyszezcmqoquz0du10jxbk',
        },
        channels: [channel],
      }),
    [channel],
  );

  const handleMessage = (_channel: string, user: ChatUserstate, message: string): void => {
    if (message.startsWith(command)) {
      const regExp = new RegExp(`${command}(?:$|\\s(.*))`);
      const payload = (regExp.exec(message) || [])[1];

      onCommand(user, payload);
    }
  };

  const connect = (): void => {
    client.removeAllListeners();
    client.on('message', handleMessage);
    client.on('connected', () => {
      setIsConnected(true);
      setIsLoading(false);
    });
    client.on('disconnected', () => {
      setIsConnected(false);
      setIsLoading(false);
    });

    client.connect().catch(() => setIsLoading(false));
    setIsLoading(true);
  };

  const disconnect = (): void => {
    client.disconnect().catch(() => setIsLoading(false));
    setIsLoading(true);
  };

  useEffect(() => {
    disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCommand]);

  return { connect, disconnect, isConnected, loading };
};
