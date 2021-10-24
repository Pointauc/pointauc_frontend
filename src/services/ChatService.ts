import { ChatUserstate, Client } from 'tmi.js';
import { chatBotToken } from '../constants/ignoredTokens';

type CommandCallback = (user: ChatUserstate, payload?: string) => void;
type ChatMessageHandler = (_channel: string, user: ChatUserstate, message: string) => void;

export class KeyListenersClient extends Client {
  commandListeners = new Map<string, ChatMessageHandler>();

  constructor(channel: string) {
    super({
      identity: {
        username: 'skipsome_bot',
        password: process.env.chatBotToken || chatBotToken,
      },
      channels: [channel],
    });
  }

  createCommandHandler =
    (command: string, callback: CommandCallback): ChatMessageHandler =>
    (_channel: string, user: ChatUserstate, message: string): void => {
      const regExp = new RegExp(`^${command}(?:$|\\s+(.*))`);
      const regExpResult = regExp.exec(message);

      if (regExpResult) {
        callback(user, regExpResult[1]);
      }
    };

  removeCommandListener(command: string): void {
    const callback = this.commandListeners.get(command);

    if (callback) {
      this.removeListener('message', callback);
      this.commandListeners.delete(command);
    }
  }

  listenCommand(command: string, callback: CommandCallback): void {
    if (!this.commandListeners.size) {
      this.connect();
    }

    const handler = this.createCommandHandler(command, callback);

    this.removeCommandListener(command);
    this.commandListeners.set(command, handler);
    this.addListener('message', handler);
  }

  unListenCommand(command: string): void {
    this.removeCommandListener(command);

    if (!this.commandListeners.size) {
      this.disconnect();
    }
  }
}
