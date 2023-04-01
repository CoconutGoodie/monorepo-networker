import * as Networker from "../src";

declare global {
  type PluginMessage = { pluginId: string; pluginMessage: any };
  type MessageEventHandler = (pluginMessage: any) => void;

  const pluginApi: {
    ui: {
      postMessage: Networker.TransportDelegate<any>;
      on: (topic: "message", callback: MessageEventHandler) => void;
      off: (topic: "message", callback: MessageEventHandler) => void;
    };
  };
}
