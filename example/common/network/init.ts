/// <reference path="../../example-env.d.ts" />

import { createNetworkInitializer } from "../../../src/index";
import { NetworkMessages } from "./messages";
import { Side } from "./sides";

export const initializeNetwork = createNetworkInitializer({
  messagesRegistry: NetworkMessages.registry,

  initTransports: function (register) {
    register(Side.SERVER, Side.PLUGIN, (message) => {
      fetch("ipc://plugin/", {
        method: "POST",
        body: message,
      });
    });

    register(Side.PLUGIN, Side.SERVER, (message) => {
      fetch("ipc://server/", {
        method: "POST",
        body: message,
      });
    });

    register(Side.PLUGIN, Side.UI, (message) => {
      pluginApi.ui.postMessage(message);
    });

    register(Side.UI, Side.PLUGIN, (message) => {
      parent.postMessage({ pluginMessage: message }, "*");
    });
  },
});
