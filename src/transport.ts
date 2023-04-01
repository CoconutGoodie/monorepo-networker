import { TransportMessage } from "./message";
import { NetworkSide } from "./side";
import { Consumer } from "./types";

export namespace NetworkTransports {
  export type TransportDelegate<M extends TransportMessage<any>> = Consumer<M>;

  type RegistryKey = NetworkSide<any>;
  type RegistryValue = Map<NetworkSide<any>, TransportDelegate<any>>;
  const registry: Map<RegistryKey, RegistryValue> = new Map();

  export function getDelegate(from: NetworkSide<any>, to: NetworkSide<any>) {
    return registry.get(from)?.get(to);
  }

  export function register(
    from: NetworkSide<any>,
    to: NetworkSide<any>,
    delegate: TransportDelegate<any>
  ) {
    if (!registry.has(from)) registry.set(from, new Map());
    const delegates = registry.get(from)!;
    if (!delegates.has(to)) delegates.set(to, delegate);
  }
}
