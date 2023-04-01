/// <reference path="../../example-env.d.ts" />

import * as Networker from "../../../src/index";
import { NetworkMessages } from "./messages";
import { NetworkSide } from "./sides";

export const initializeNetwork = Networker.createInitializer({
  messagesRegistry: NetworkMessages.registry,

  initTransports: function (register) {
    register(NetworkSide.SERVER, NetworkSide.PLUGIN, (message) => {
      fetch("ipc://plugin/", {
        method: "POST",
        body: message,
      });
    });

    register(NetworkSide.PLUGIN, NetworkSide.SERVER, (message) => {
      fetch("ipc://server/", {
        method: "POST",
        body: message,
      });
    });

    register(NetworkSide.PLUGIN, NetworkSide.UI, (message) => {
      pluginApi.ui.postMessage(message);
    });

    register(NetworkSide.UI, NetworkSide.PLUGIN, (message) => {
      parent.postMessage({ pluginMessage: message }, "*");
    });
  },
});
