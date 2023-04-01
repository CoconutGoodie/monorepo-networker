import { initializeNetwork } from "../common/network/init";
import { NetworkMessages } from "../common/network/messages";
import { NetworkSide } from "../common/network/sides";

initializeNetwork(NetworkSide.PLUGIN);

NetworkMessages.DISPLAY_POPUP.send({
  title: "Hello There!",
  body: "<p>Hello World!</p>",
});

NetworkMessages.DISPLAY_POPUP.request({
  title: "Hello There!",
  body: "<p>Requester minds about the response!</p>",
}).then((response) => {
  console.log(response);
});
