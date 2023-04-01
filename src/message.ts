import * as uuid from "uuid";
import { NetworkSide } from "./side";
import { NetworkTransports } from "./transport";
import { AutoComplete } from "./types";

export interface TransportMessage<P> {
  requestId: string;
  type: AutoComplete<string, "response">;
  from: string;
  payload: P;
}

export abstract class NetworkMessage<P, R = void> {
  constructor(private name: string) {}

  public getName() {
    return this.name;
  }

  public abstract receivingSide(): NetworkSide<any>;

  public abstract handle(payload: P, from: NetworkSide<any>): R;

  private createTransportMessage(payload: P): TransportMessage<P> {
    const currentSide = NetworkSide.current;
    return {
      requestId: uuid.v4(),
      type: this.getName(),
      from: currentSide.getName(),
      payload,
    };
  }

  public send(payload: P) {
    const currentSide = NetworkSide.current;
    const receivingSide = this.receivingSide();
    const message = this.createTransportMessage(payload);
    const delegate = NetworkTransports.getDelegate(currentSide, receivingSide);

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
      NetworkSide.current.beginListening(
        null,
        (message: TransportMessage<R>) => {
          if (message.requestId === sentMessage.requestId) {
            resolve(message.payload);
            return true;
          }
          return false;
        }
      );
    });
  }
}

export class NetworkMessageRegistry {
  private registry: Map<string, NetworkMessage<any, any>> = new Map();

  public byName(name: string) {
    return this.registry.get(name);
  }

  public register<P, R>(message: NetworkMessage<P, R>) {
    this.registry.set(message.getName(), message);
    return message;
  }
}
