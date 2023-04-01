import { NetworkMessageRegistry } from "./message";
import { NetworkSide } from "./side";
import { NetworkTransports } from "./transport";

interface Options {
  messagesRegistry: NetworkMessageRegistry;
  initTransports: (register: typeof NetworkTransports.register) => void;
}

export function createNetworkInitializer(opts: Options) {
  return <E>(currentSide: NetworkSide<E>) => {
    NetworkSide.current = currentSide;
    currentSide.beginListening(opts.messagesRegistry);

    opts.initTransports(NetworkTransports.register);
  };
}
