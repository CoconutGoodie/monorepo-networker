import { Networker } from "../../../../src";
import { CLIENT, SERVER } from "../../common/networkSides";
import { CLIENT_CHANNEL } from "./networkChannel";

Networker.initialize(CLIENT, CLIENT_CHANNEL);

console.log("We're at", Networker.getCurrentSide().name);

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

  // Only sends
  CLIENT_CHANNEL.emit(SERVER, "markPresence", true);

  // Awaits for ack
  CLIENT_CHANNEL.request(SERVER, "markPresence", true);

  CLIENT_CHANNEL.request(SERVER, "fetchUser", "USR-1").then((user) => {
    console.log("Responded with", user);
  });

  CLIENT_CHANNEL.subscribe("receiveUser", (user, from) => {
    console.log(`Wow! ${from.name} sent us a user info: ${user}`);
  });
}

bootstrap();
