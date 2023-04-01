import { TransportMessage } from "./message";
import { Side } from "./side";
import { Consumer } from "./types";

export type TransportDelegate<M extends TransportMessage<any>> = Consumer<M>;

export namespace Transports {
  type RegistryKey = Side;
  type RegistryValue = Map<Side, TransportDelegate<any>>;
  const registry: Map<RegistryKey, RegistryValue> = new Map();

  export function getDelegate(from: Side, to: Side) {
    return registry.get(from)?.get(to);
  }

  export function register(
    from: Side,
    to: Side,
    delegate: TransportDelegate<any>
  ) {
    if (!registry.has(from)) registry.set(from, new Map());
    const delegates = registry.get(from)!;
    if (!delegates.has(to)) delegates.set(to, delegate);
  }
}
