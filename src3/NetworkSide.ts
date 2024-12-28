import { TrimMethodsReturning } from "./TypeUtils";

export type MessageCallback = (message: any) => void;

export interface AcceptedEvents {
  [eventName: string]: (...args: any[]) => any;
}

export class MonorepoNetworker {
  private static currentSide: NetworkSide<any>;

  public static get current() {
    return MonorepoNetworker.currentSide;
  }
  public static set current(side) {
    if (MonorepoNetworker.currentSide != null) {
      throw new Error("Logical side can be declared only once.");
    }
    MonorepoNetworker.currentSide = side;
  }

  public static initialize<T extends AcceptedEvents>(
    side: NetworkSide<T>,
    handler: NetworkHandler<T, any>
  ) {
    MonorepoNetworker.current = side;
  }
}

export class NetworkSide<T extends AcceptedEvents> {
  constructor(public readonly name: string) {}
}

export class NetworkHandler<T extends AcceptedEvents, TListenerRef> {
  messageHandlers: { [K in keyof T]?: T[K] };

  constructor(
    private readonly side: NetworkSide<T>,
    private readonly config: {
      attachListener: (next: any) => TListenerRef;
      detachListener: (ref: TListenerRef) => void;
    }
  ) {}

  public registerEmitStrategy(
    to: NetworkSide<any>,
    strategy: (message: any) => void
  ) {
    // TODO
    return this;
  }

  public registerMessageHandler<E extends keyof T>(
    eventName: E,
    handler: (...args: Parameters<T[E]>) => ReturnType<T[E]>
  ) {}

  public emit<T extends AcceptedEvents, E extends keyof T>(
    to: NetworkSide<T>,
    eventName: E,
    eventArgs: Parameters<T[E]>
  ) {
    return eventName;
  }

  public async request<
    T extends AcceptedEvents,
    E extends keyof TrimMethodsReturning<T, void>
  >(from: NetworkSide<T>, eventName: E, eventArgs: Parameters<T[E]>) {
    return eventName as unknown as typeof from extends NetworkSide<infer X>
      ? E extends keyof X
        ? ReturnType<X[E]>
        : never
      : never;
  }
}

// --------- @common/network/sides.ts

export const UI = new NetworkSide<{
  focusOnSelected(): void;
  focusOnElement(elementId: string): void;
}>("UI-side");

export const CLIENT = new NetworkSide<{
  getClientTime(): number;
  execute(script: string): void;
}>("Client-side");

export const SERVER = new NetworkSide<{
  getServerTime(): number;
  fetchUser(userId: string): { id: string; name: string };
  markPresence(online: boolean): void;
}>("Server-side");

// --------- @client/network/clientChannel.ts

export const CLIENT_CHANNEL = new NetworkHandler(CLIENT, {
  attachListener(next) {
    const listener = (event: MessageEvent) => {
      if (event.data?.pluginId == null) return;
      next(event.data.pluginMessage);
    };
    window.addEventListener("message", listener);
    return listener;
  },
  detachListener(listener) {
    window.removeEventListener("message", listener);
  },
});

CLIENT_CHANNEL.registerEmitStrategy(UI, (message) =>
  console.log("Sending to UI", message)
);

CLIENT_CHANNEL.registerEmitStrategy(SERVER, (message) =>
  parent.postMessage({ pluginMessage: message }, "*")
);

CLIENT_CHANNEL.registerMessageHandler("execute", (script) => {
  eval(script);
});

CLIENT_CHANNEL.registerMessageHandler("getClientTime", () => {
  return Date.now();
});

// --------- @client/main.ts

MonorepoNetworker.initialize(CLIENT, CLIENT_CHANNEL);

async function bootstrap() {
  CLIENT_CHANNEL.emit(SERVER, "getServerTime", []);

  const user = await CLIENT_CHANNEL.request(SERVER, "fetchUser", ["USR-1"]);
  console.log(user.id);
  console.log(user.name);
}
