import { MonorepoNetworker } from "../../../src3";
import { CLIENT, SERVER } from "../common/network/sides";
import { CLIENT_CHANNEL } from "./network/clientChannel";

MonorepoNetworker.initialize(CLIENT, CLIENT_CHANNEL);

console.log("We're at", MonorepoNetworker.currentSide);

async function bootstrap() {
  CLIENT_CHANNEL.emit(SERVER, "markPresence", [true]);

  const user = await CLIENT_CHANNEL.request(SERVER, "fetchUser", ["USR-1"]);
  console.log(user.id);
  console.log(user.name);

  const serverTime = await CLIENT_CHANNEL.request(SERVER, "getServerTime", []);
  console.log(serverTime);
}

bootstrap();
