import { NetworkMessage } from "../../../../src";
import { CLIENT, SERVER } from "../common/networkSides";

export const SERVER_CHANNEL = SERVER.channelBuilder()
  .emitsTo(SERVER, (message, metadata: { resourceName: string }) => {
    emit("__MonorepoNetworker_serverIpc", metadata.resourceName, message);
  })
  .emitsTo(CLIENT, (message, metadata: { clientId: number | string }) => {
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
          next(message, { resourceName: GetCurrentResourceName() });
        }
      }
    );
  })
  .startListening();

// ----------- Message Handlers

SERVER_CHANNEL.registerMessageHandler("fetchPlayerLocation", () => {
  return GetEntityCoords(global.source) as [number, number];
});
