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
  parent.postMessage({ pluginMessage: message }, "*");
});
CLIENT_CHANNEL.registerEmitStrategy(SERVER, (message) => {
  fetch("server://", { method: "POST", body: JSON.stringify(message) });
});

// ----------- Message Handlers

CLIENT_CHANNEL.registerMessageHandler("execute", (script, from) => {
  eval(script);
});
CLIENT_CHANNEL.registerMessageHandler("getClientTime", () => {
  return Date.now();
});
CLIENT_CHANNEL.registerMessageHandler("receiveUser", (user) => {
  console.log("A user is received:", user);
});
