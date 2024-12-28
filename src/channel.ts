import { MonorepoNetworker } from "./networker";
import { NetworkEvents, NetworkSide } from "./side";
import { TrimMethodsReturning } from "./types";
import { uuidV4 } from "./util/uuid_v4";

const INTERNAL_RESPOND_EVENT = "__INTERNAL_RESPOND_EVENT";

export interface NetworkMessage {
  messageId: string;
  fromSide: string;
  eventName: string;
  payload: any[];
}

type MessageConsumer = (message: NetworkMessage) => void;

type MessageHandler<TEvents extends NetworkEvents, E extends keyof TEvents> = (
  ...args: [...Parameters<TEvents[E]>, ...[from: NetworkSide<any>]]
) => ReturnType<TEvents[E]>;

export type ChannelConfig = {
  attachListener?: (next: MessageConsumer) => (() => void) | void;
};

export class NetworkChannel<TEvents extends NetworkEvents, TListenerRef> {
  protected listenerRef?: TListenerRef;
  protected messageHandlers: {
    [K in keyof TEvents]?: MessageHandler<TEvents, K>;
  } = {};
  protected emitStrategies: Map<string, MessageConsumer> = new Map();
  protected pendingRequests: Map<string, any> = new Map();
  protected listenerCleanup?: (() => void) | void;

  constructor(
    public readonly side: NetworkSide<TEvents>,
    protected readonly config?: ChannelConfig
  ) {}

  protected init() {
    this.listenerCleanup = this.config?.attachListener?.(
      (message: NetworkMessage) => this.receiveNetworkMessage(message)
    );
  }

  public registerEmitStrategy(to: NetworkSide<any>, strategy: MessageConsumer) {
    this.emitStrategies.set(to.name, strategy);
  }

  public registerMessageHandler<E extends keyof TEvents>(
    eventName: E,
    handler: MessageHandler<TEvents, E>
  ) {
    this.messageHandlers[eventName] = handler;
  }

  protected getEmitStrategy(side: string): MessageConsumer;
  protected getEmitStrategy(side: NetworkSide<any>): MessageConsumer;
  protected getEmitStrategy(side: any) {
    const sideName = side instanceof NetworkSide ? side.name : side;
    const strategy = this.emitStrategies.get(sideName);

    if (!strategy) {
      const currentSide = MonorepoNetworker.currentSide;
      throw new Error(
        `No emit strategy is registered from ${currentSide.name} to ${sideName}`
      );
    }

    return strategy;
  }

  protected receiveNetworkMessage(message: NetworkMessage) {
    if (message.eventName === INTERNAL_RESPOND_EVENT) {
      const resolveValue = this.pendingRequests.get(message.messageId);
      if (resolveValue) {
        this.pendingRequests.delete(message.messageId);
        resolveValue(message.payload[0]);
      }
      return;
    }

    const handler = this.messageHandlers[message.eventName];
    if (handler != null) {
      const result = handler(
        ...(message.payload as never),
        MonorepoNetworker.getSide(message.fromSide)
      );

      const emit = this.getEmitStrategy(message.fromSide);

      if (emit != null) {
        emit({
          messageId: message.messageId,
          fromSide: message.fromSide,
          eventName: INTERNAL_RESPOND_EVENT,
          payload: [result],
        });
      }
    }
  }

  public emit<T extends NetworkEvents, E extends keyof T>(
    targetSide: NetworkSide<T>,
    eventName: E,
    ...eventArgs: Parameters<T[E]>
  ) {
    const emit = this.getEmitStrategy(targetSide);

    emit({
      messageId: uuidV4(),
      fromSide: MonorepoNetworker.currentSide.name,
      eventName: eventName.toString(),
      payload: eventArgs,
    });
  }

  public async request<
    T extends NetworkEvents,
    E extends keyof TrimMethodsReturning<T, void>
  >(targetSide: NetworkSide<T>, eventName: E, ...eventArgs: Parameters<T[E]>) {
    const emit = this.getEmitStrategy(targetSide);

    const messageId = uuidV4();

    return new Promise<ReturnType<T[E]>>((resolveValue) => {
      this.pendingRequests.set(messageId, resolveValue);

      emit({
        messageId,
        fromSide: MonorepoNetworker.currentSide.name,
        eventName: eventName.toString(),
        payload: eventArgs,
      });
    });
  }
}
