import { MonorepoNetworker } from "./networker";
import { NetworkEvents, NetworkSide } from "./side";
import { uuidV4 } from "./util/uuid_v4";

const INTERNAL_RESPOND_EVENT = "__INTERNAL_RESPOND_EVENT";

export interface NetworkMessage {
  /** UUIDv4 ID issues for this message */
  messageId: string;
  /** Name of the logical side, which created this message */
  fromSide: string;
  /** Name of the event */
  eventName: string;
  /** Arguments of the event */
  payload: any[];
}

type MessageConsumer = (message: NetworkMessage) => void;

type MessageHandler<TEvents extends NetworkEvents, E extends keyof TEvents> = (
  ...args: [...Parameters<TEvents[E]>, ...[from: NetworkSide<any>]]
) => ReturnType<TEvents[E]>;

type SubscriptionHandler<
  TEvents extends NetworkEvents,
  E extends keyof TEvents
> = (
  ...args: [...Parameters<TEvents[E]>, ...[from: NetworkSide<any>]]
) => undefined;

export type ChannelConfig = {
  /**
   * Define how this side listens to incoming messages.
   *
   * @param next Callback function that is supposed to be invoked with the message when an event is received.
   * @returns An optional cleanup function, that declares how this side detaches the attached listener(s).
   */
  attachListener?: (
    /** Callback function that is supposed to be invoked with the message when an event is received. */
    next: MessageConsumer
  ) => (() => void) | void;
};

export class NetworkChannel<TEvents extends NetworkEvents, TListenerRef> {
  protected listenerRef?: TListenerRef;
  protected messageHandlers: {
    [K in keyof TEvents]?: MessageHandler<TEvents, K>;
  } = {};
  protected subscriptionListeners: {
    [K in keyof TEvents]?: Record<string, SubscriptionHandler<TEvents, K>>;
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

  /**
   * Register a strategy on how this side emits message to a certain other side.
   * @param to The target network side to which messages will be emitted.
   * @param strategy Strategy for emitting a message.
   */
  public registerEmitStrategy(to: NetworkSide<any>, strategy: MessageConsumer) {
    this.emitStrategies.set(to.name, strategy);
  }

  /**
   * Register a handler for an incoming message.
   * The handler is responsible of listening to incoming events, and possibly responding/returning a value to them.
   * @param eventName Name of the event to be listened
   * @param handler Handler that accepts incoming message and sender, then consumes them.
   */
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
      const currentSide = MonorepoNetworker.getCurrentSide();
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

    Object.values(this.subscriptionListeners[message.eventName] ?? {}).forEach(
      (listener) => {
        listener(
          ...(message.payload as never),
          MonorepoNetworker.getSide(message.fromSide)
        );
      }
    );

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
      fromSide: MonorepoNetworker.getCurrentSide().name,
      eventName: eventName.toString(),
      payload: eventArgs,
    });
  }

  public async request<T extends NetworkEvents, E extends keyof T>(
    targetSide: NetworkSide<T>,
    eventName: E,
    ...eventArgs: Parameters<T[E]>
  ) {
    const emit = this.getEmitStrategy(targetSide);

    const messageId = uuidV4();

    return new Promise<ReturnType<T[E]>>((resolveValue) => {
      this.pendingRequests.set(messageId, resolveValue);

      emit({
        messageId,
        fromSide: MonorepoNetworker.getCurrentSide().name,
        eventName: eventName.toString(),
        payload: eventArgs,
      });
    });
  }

  public subscribe<E extends keyof TEvents>(
    eventName: E,
    eventListener: SubscriptionHandler<TEvents, E>
  ) {
    const subId = uuidV4();

    this.subscriptionListeners[eventName] ??= {};
    this.subscriptionListeners[eventName][subId] = eventListener;

    return () => {
      delete this.subscriptionListeners[eventName]![subId];
    };
  }
}
