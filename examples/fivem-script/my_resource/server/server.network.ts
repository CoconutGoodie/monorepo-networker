import { NetworkMessage } from "../../../../src";
import { CLIENT, SERVER } from "../common/networkSides";

export const SERVER_CHANNEL = SERVER.channelBuilder()
  .emitsTo(SERVER, (message) => {
    // emit("__MonorepoNetworker_serverIpc", metadata.resourceName, message);
  })
  .emitsTo(CLIENT, (message, metadata: { clientId: number }) => {
    emitNet("__MonorepoNetworker_serverToClientIpc", metadata.clientId, [
      message,
    ]);
  })
  .receivesFrom(CLIENT, (next) => {
    onNet(
      "__MonorepoNetworker_clientToServerIpc",
      (message: NetworkMessage) => {
        next(message, { clientId: global.source });
      }
    );
  })
  .receivesFrom(SERVER, (next) => {
    on(
      "__MonorepoNetworker_serverIpc",
      (targetResource: string, message: NetworkMessage) => {
        if (targetResource === GetCurrentResourceName()) {
          next(message);
          // next(message, { resourceName: GetCurrentResourceName() });
        }
      }
    );
  })
  .startListening();

// ----------- Message Handlers

SERVER_CHANNEL.emit(SERVER, "createWaypoint", [100, 200]);

SERVER_CHANNEL.emit(CLIENT, "updatePlayerLocation", [100, 200], {
  clientId: -1,
});

SERVER_CHANNEL.subscribe("createWaypoint", (x, y) => {});
