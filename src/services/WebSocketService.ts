const TWITCH_WEBSOCKET_URL = 'wss://pubsub-edge.twitch.tv';
const USERNAME_COOKIE_KEY = 'username';
const CHANNEL_MODERATE_TOPIC = 'chat_moderator_actions';

const PING_INTERVAL = 1000 * 60; // ms between PING's
const RECONNECT_INTERVAL = 1000 * 3; // ms to wait before reconnect

class WebSocketService<T> {
  private ws?: WebSocket;
  private readonly messageHandler?: (message: T) => void;
  private readonly closeHandler?: () => void;
  private readonly openHandler?: (ws: WebSocket) => void;
  private pingHandle?: number;

  get socket(): WebSocket | undefined {
    return this.ws;
  }

  constructor(
    messageHandler?: (message: T) => void,
    closeHandler?: () => void,
    openHandler?: (ws: WebSocket) => void,
  ) {
    this.messageHandler = messageHandler;
    this.closeHandler = closeHandler;
    this.openHandler = openHandler;
  }

  connect = (url: string) => {
    this.ws = new WebSocket(url);
    console.log('connecting');
    this.ws.onopen = this.onOpen;
    this.ws.onerror = this.onError;
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;
  };

  pingConnection = (): void => {
    const message = {
      type: 'PING',
    };
    if (this.ws) {
      this.ws.send(JSON.stringify(message));
    }
    console.log('ping');
  };

  private onOpen = (): void => {
    console.log('opened');
    this.pingConnection();
    this.pingHandle = window.setInterval(this.pingConnection, PING_INTERVAL);
    if (this.openHandler && this.ws) {
      this.openHandler(this.ws);
    }
  };

  private onError = (error: Event): void => {
    console.log(error);
  };

  private onMessage = (event: MessageEvent): void => {
    const message = JSON.parse(event.data);
    if (this.messageHandler) {
      this.messageHandler(message);
    }
  };

  private onClose = (): void => {
    console.log('connection closed');
    if (this.pingHandle) {
      clearInterval(this.pingHandle);
    }
    if (this.closeHandler) {
      this.closeHandler();
    }
  };
}

export default WebSocketService;
