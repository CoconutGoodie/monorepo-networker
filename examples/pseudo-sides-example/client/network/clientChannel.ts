import { NetworkHandler } from "../../../../src3";
import { CLIENT, SERVER, UI } from "../../common/network/sides";

export const CLIENT_CHANNEL = new NetworkHandler(CLIENT, {
  attachListener(next) {
    const listener = (event: MessageEvent) => {
      if (event.data?.pluginId == null) return;
      next(event.data.pluginMessage);
    };
    window.addEventListener("message", listener);
    return listener;
  },
  detachListener(listener) {
    window.removeEventListener("message", listener);
  },
});

// ----------- Transports

CLIENT_CHANNEL.registerEmitStrategy(UI, (message) => {
  console.log("Sending to UI", message);
});
CLIENT_CHANNEL.registerEmitStrategy(SERVER, (message) => {
  parent.postMessage({ pluginMessage: message }, "*");
});

// ----------- Message Handlers

CLIENT_CHANNEL.registerMessageHandler("execute", (script) => {
  eval(script);
});
CLIENT_CHANNEL.registerMessageHandler("getClientTime", () => {
  return Date.now();
});
