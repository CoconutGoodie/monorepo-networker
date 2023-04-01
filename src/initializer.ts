import { MessageTypeRegistry } from "./message";
import { Side } from "./side";
import { Transports } from "./transport";

interface Options {
  messagesRegistry: MessageTypeRegistry;
  initTransports: (register: typeof Transports.register) => void;
}

export function createInitializer(opts: Options) {
  return <E>(currentSide: Side<E>) => {
    Side.current = currentSide;
    currentSide.beginListening(opts.messagesRegistry);

    opts.initTransports(Transports.register);
  };
}
