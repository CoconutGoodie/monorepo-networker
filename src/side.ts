import { MessageTypeRegistry, TransportMessage } from "./message";
import { Transports } from "./transport";
import { Consumer } from "./types";

export type ListenerDetachPredicate<T> = (
  message: TransportMessage<T>
) => boolean;

export class Side<E = any> {
  private static currentSide: Side;

  public static get current() {
    return Side.currentSide;
  }
  public static set current(side) {
    if (Side.currentSide != null) {
      throw new Error("Logical side can be declared only once.");
    }
    Side.currentSide = side;
  }

  /* ------------------------ */

  private static sides: Map<string, Side> = new Map();

  public static register(side: Side) {
    this.sides.set(side.getName(), side);
    return side;
  }

  public static byName(name: string) {
    return this.sides.get(name);
  }

  constructor(
    private name: string,
    private definitions: {
      shouldHandle?: (event: E) => boolean;
      messageGetter?: (event: E) => TransportMessage<any>;
      attachListener: (callback: Consumer<E>) => void;
      detachListener: (callback: Consumer<E>) => void;
    }
  ) {}

  public getName() {
    return this.name;
  }

  public beginListening(
    forMessages: MessageTypeRegistry | null,
    until?: ListenerDetachPredicate<E>
  ) {
    const callback = (event: E) => {
      if (this.definitions.shouldHandle != null) {
        if (!this.definitions.shouldHandle(event)) {
          return;
        }
      }

      const transportMessage =
        this.definitions.messageGetter?.(event) ??
        (event as TransportMessage<any>);

      // Handle if it isn't a response
      if (transportMessage.type !== "response") {
        const messageType = forMessages?.byName(
          transportMessage.type as string
        );

        if (messageType == null) {
          if (forMessages != null) {
            console.warn("Unknown message received ->", transportMessage.type);
          }
        } else {
          const from = Side.byName(transportMessage.from)!;
          const result = messageType.handle(transportMessage.payload, from);
          if (result !== undefined) {
            const sendResponse = (response: any) => {
              const currentSide = Side.current;
              const delegate = Transports.getDelegate(currentSide, from);
              delegate?.({
                from: Side.current.getName(),
                type: "response",
                requestId: transportMessage.requestId,
                payload: response,
              } as TransportMessage<typeof response>);
            };

            // If promise, invoke with resolved value
            typeof result?.then === "function"
              ? (result as Promise<any>).then(sendResponse)
              : sendResponse(result);
          }
        }
      }

      if (until?.(transportMessage)) {
        this.definitions.detachListener(callback);
      }
    };
    this.definitions.attachListener(callback);
  }
}
