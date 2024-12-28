import { MonorepoNetworker } from "../../../../src";
import { CLIENT, SERVER } from "../../common/networkSides";
import { CLIENT_CHANNEL } from "./networkChannel";

MonorepoNetworker.initialize(CLIENT, CLIENT_CHANNEL);

console.log("We're at", MonorepoNetworker.getCurrentSide().name);

async function bootstrap() {
  CLIENT_CHANNEL.emit(SERVER, "markPresence", true);

  const user = await CLIENT_CHANNEL.request(SERVER, "fetchUser", "USR-1");
  console.log(user.id);
  console.log(user.name);

  const serverTime = await CLIENT_CHANNEL.request(SERVER, "getServerTime");
  console.log(serverTime);

  const unsub = CLIENT_CHANNEL.subscribe("execute", (script, from) => {
    console.log("Gotta execute script", from.name);
    eval(script);
  });

  setTimeout(() => unsub(), 5000);
}

bootstrap();
