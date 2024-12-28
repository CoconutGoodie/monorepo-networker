import { AcceptedEvents, NetworkSide } from "./side";
import { TrimMethodsReturning } from "./TypeUtils";

export class NetworkHandler<T extends AcceptedEvents, TListenerRef> {
  messageHandlers: { [K in keyof T]?: T[K] };

  constructor(
    private readonly side: NetworkSide<T>,
    private readonly config?: {
      attachListener?: (next: any) => TListenerRef;
      detachListener?: (ref: TListenerRef) => void;
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
