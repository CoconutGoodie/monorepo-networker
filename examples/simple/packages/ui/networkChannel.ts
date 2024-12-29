import { CLIENT, SERVER, UI } from "../../common/networkSides";

export const UI_CHANNEL = UI.createChannel({
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

UI_CHANNEL.registerEmitStrategy(CLIENT, (message) => {
  parent.postMessage({ pluginMessage: message }, "*");
});
UI_CHANNEL.registerEmitStrategy(SERVER, (message) => {
  fetch("server://", { method: "POST", body: JSON.stringify(message) });
});
