import { MonorepoNetworker } from "./networker";
import { AcceptedEvents, NetworkSide } from "./side";
import { TrimMethodsReturning } from "./TypeUtils";
import { uuidV4 } from "./util/uuid_v4";

const INTERNAL_RESPOND_EVENT = "__INTERNAL_RESPOND_EVENT";

export interface NetworkMessage {
  messageId: string;
  fromSide: string;
  eventName: string;
  payload: any[];
}

type MessageConsumer = (message: NetworkMessage) => void;

export class NetworkHandler<TEvents extends AcceptedEvents, TListenerRef> {
  protected listenerRef?: TListenerRef;
  protected messageHandlers: { [K in keyof TEvents]?: TEvents[K] } = {};
  protected emitStrategies: Map<string, MessageConsumer> = new Map();
  protected pendingRequests: Map<string, any> = new Map();

  constructor(
    public readonly side: NetworkSide<TEvents>,
    protected readonly config?: {
      attachListener?: (next: MessageConsumer) => TListenerRef;
      detachListener?: (ref: TListenerRef) => void;
    }
  ) {}

  protected init() {
    this.listenerRef = this.config?.attachListener?.(
      this.receiveNetworkerMessage
    );
  }

  public registerEmitStrategy(to: NetworkSide<any>, strategy: MessageConsumer) {
    this.emitStrategies.set(to.name, strategy);
  }

  public registerMessageHandler<E extends keyof TEvents>(
    eventName: E,
    handler: TEvents[E]
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

  protected receiveNetworkerMessage(message: NetworkMessage) {
    if (message.eventName === INTERNAL_RESPOND_EVENT) {
      const resolveValue = this.pendingRequests.get(message.messageId);
      this.pendingRequests.delete(message.messageId);
      resolveValue(message.payload[0]);
      return;
    }

    const handler = this.messageHandlers[message.eventName];

    if (handler != null) {
      const result = handler(...message.payload);
      const emit = this.getEmitStrategy(message.fromSide);
      emit({
        messageId: message.messageId,
        fromSide: message.fromSide,
        eventName: INTERNAL_RESPOND_EVENT,
        payload: [result],
      });
    }
  }

  public emit<T extends AcceptedEvents, E extends keyof T>(
    targetSide: NetworkSide<T>,
    eventName: E,
    eventArgs: Parameters<T[E]>
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
    T extends AcceptedEvents,
    E extends keyof TrimMethodsReturning<T, void>
  >(targetSide: NetworkSide<T>, eventName: E, eventArgs: Parameters<T[E]>) {
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
