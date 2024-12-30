import { PLUGIN, UI } from "@common/networkSides";

export const UI_CHANNEL = UI.createChannel({
  attachListener: (next) => {
    const listener = (event: MessageEvent) => {
      if (event.data?.pluginId == null) return;
      next(event.data.pluginMessage);
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  },
});

// ---------- Emission strategies

UI_CHANNEL.registerEmitStrategy(PLUGIN, (message) => {
  parent.postMessage({ pluginMessage: message }, "*");
});

// ---------- Message handlers

UI_CHANNEL.registerMessageHandler("hello", (text, side) => {
  console.log(`${side.name} said "${text}"`);
});
