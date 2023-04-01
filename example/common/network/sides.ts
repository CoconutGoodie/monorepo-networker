/// <reference path="../../example-env.d.ts" />

import { NetworkSide } from "../../../src/index";

export namespace Side {
  export const UI = NetworkSide.register(
    new NetworkSide("UI", {
      attachListener: (callback) =>
        window.addEventListener("message", callback),
      detachListener: (callback) =>
        window.addEventListener("message", callback),
    })
  );

  export const PLUGIN = NetworkSide.register(
    new NetworkSide<MessageEvent>("Plugin", {
      shouldHandle: (event) => event.data.pluginId != null,
      messageGetter: (event) => (event.data as PluginMessage).pluginMessage,
      attachListener: (callback) => pluginApi.ui.on("message", callback),
      detachListener: (callback) => pluginApi.ui.off("message", callback),
    })
  );

  export const SERVER = NetworkSide.register(
    new NetworkSide("Server", {
      attachListener: () => {},
      detachListener: () => {},
    })
  );
}
