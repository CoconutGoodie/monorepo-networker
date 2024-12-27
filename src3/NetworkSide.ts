export type MessageCallback = (message: any) => void;

export interface AcceptedEvents {
  [eventName: string]: (...args: any[]) => any;
}

export class MonorepoNetworker {
  private static currentSide: NetworkHandler<any>;

  public static get current() {
    return MonorepoNetworker.currentSide;
  }
  public static set current(side) {
    if (MonorepoNetworker.currentSide != null) {
      throw new Error("Logical side can be declared only once.");
    }
    MonorepoNetworker.currentSide = side;
  }
}

export class NetworkSide<T extends AcceptedEvents> {
  constructor(public readonly name: string) {}
}

export class NetworkHandler<T extends AcceptedEvents> {
  messageHandlers: { [K in keyof T]?: T[K] };

  constructor(private readonly side: NetworkSide<T>) {}

  // public register

  public registerEmitStrategy(
    to: NetworkSide<any>,
    strategy: (message: any) => void
  ) {
    // TODO
    return this;
  }

  public emit<T extends AcceptedEvents, E extends keyof T>(
    to: NetworkSide<T>,
    eventName: E,
    eventArgs: Parameters<T[E]>
  ) {
    return eventName;
  }
}

// @common/network/sides.ts

export const CLIENT = new NetworkSide<{
  execute(script: string): void;
}>("Client-side");

export const SERVER = new NetworkSide<{
  getServerTime(): number;
  fetchUser(userId: string): { id: string; name: string };
}>("Server-side");

// @client/network/handlers.ts

export const CLIENT_CHANNEL = new NetworkHandler(CLIENT)
  .registerEmitStrategy(SERVER, (message) =>
    parent.postMessage({ pluginMessage: message }, "*")
  )
  .registerEmitStrategy(SERVER, (message) =>
    parent.postMessage({ pluginMessage: message }, "*")
  );

// @client/main.ts

CLIENT_CHANNEL.emit(SERVER, "getServerTime", []);
CLIENT_CHANNEL.emit(SERVER, "fetchUser", ["USR-1"]);
