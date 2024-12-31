import { CLIENT, SERVER } from "../common/networkSides";
import { SERVER_CHANNEL } from "./server.network";

setTick(() => {
  getPlayers().forEach((playerId) => {
    const ped = GetPlayerPed(playerId);

    const position = GetEntityCoords(ped);

    SERVER_CHANNEL.emit(
      CLIENT,
      "updatePlayerLocation",
      [position[0], position[1]],
      { clientId: playerId }
    );
  });
});

SERVER_CHANNEL.emit(SERVER, "createWaypoint", [100, 200], {
  resourceName: "other_resource",
});

SERVER_CHANNEL.emit(CLIENT, "updatePlayerLocation", [100, 200], {
  clientId: -1,
});

SERVER_CHANNEL.subscribe("createWaypoint", (x, y) => {
  console.log("Create waypoint", x, y);
});
