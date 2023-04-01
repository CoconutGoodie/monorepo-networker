/// <reference path="../../example-env.d.ts" />

import * as Networker from "../../../src/index";

export namespace NetworkSide {
  export const UI = Networker.Side.register(
    new Networker.Side("UI", {
      attachListener: (callback) =>
        window.addEventListener("message", callback),
      detachListener: (callback) =>
        window.addEventListener("message", callback),
    })
  );

  export const PLUGIN = Networker.Side.register(
    new Networker.Side<MessageEvent>("Plugin", {
      shouldHandle: (event) => event.data.pluginId != null,
      messageGetter: (event) => (event.data as PluginMessage).pluginMessage,
      attachListener: (callback) => pluginApi.ui.on("message", callback),
      detachListener: (callback) => pluginApi.ui.off("message", callback),
    })
  );

  export const SERVER = Networker.Side.register(
    new Networker.Side("Server", {
      attachListener: () => {},
      detachListener: () => {},
    })
  );
}
