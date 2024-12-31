import { CLIENT, NUI } from "@common/networkSides";

export const NUI_CHANNEL = NUI.createChannel({
  attachListener(next) {
    const listener = (event: MessageEvent) => {
      next(event.data);
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  },
});

// ----------- Transports

// NUI_CHANNEL.registerEmitStrategy(CLIENT)

// ----------- Message Handlers
