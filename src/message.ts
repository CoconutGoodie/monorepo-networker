import * as uuid from "uuid";
import { Side } from "./side";
import { Transports } from "./transport";
import { AutoComplete } from "./types";

export interface TransportMessage<P> {
  requestId: string;
  type: AutoComplete<string, "response">;
  from: string;
  payload: P;
}

export abstract class MessageType<P, R = void> {
  constructor(private name: string) {}

  public getName() {
    return this.name;
  }

  public abstract receivingSide(): Side;

  public abstract handle(payload: P, from: Side): R;

  private createTransportMessage(payload: P): TransportMessage<P> {
    const currentSide = Side.current;
    return {
      requestId: uuid.v4(),
      type: this.getName(),
      from: currentSide.getName(),
      payload,
    };
  }

  public send(payload: P) {
    const currentSide = Side.current;
    const receivingSide = this.receivingSide();
    const message = this.createTransportMessage(payload);
    const delegate = Transports.getDelegate(currentSide, receivingSide);

    if (!delegate) {
      throw new Error(
        `Transportation from ${currentSide.getName()} to ${receivingSide.getName()} is not supported.`
      );
    }

    delegate(message);

    return message;
  }

  public async request(payload: P): Promise<R> {
    const sentMessage = this.send(payload);

    return new Promise<R>((resolve) => {
      Side.current.beginListening(null, (message: TransportMessage<R>) => {
        if (message.requestId === sentMessage.requestId) {
          resolve(message.payload);
          return true;
        }
        return false;
      });
    });
  }
}

export class MessageTypeRegistry {
  private registry: Map<string, MessageType<any, any>> = new Map();

  public byName(name: string) {
    return this.registry.get(name);
  }

  public register<P, R>(message: MessageType<P, R>) {
    this.registry.set(message.getName(), message);
    return message;
  }
}
