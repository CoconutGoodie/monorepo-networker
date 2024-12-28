import { CLIENT, SERVER, UI } from "../../common/networkSides";

export const CLIENT_CHANNEL = CLIENT.createChannel({
  attachListener(next) {
    const listener = (event: MessageEvent) => {
      if (event.data?.pluginId == null) return;
      next(event.data.pluginMessage);
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
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

CLIENT_CHANNEL.registerMessageHandler("execute", (script, from) => {
  eval(script);
});
CLIENT_CHANNEL.registerMessageHandler("getClientTime", () => {
  return Date.now();
});
