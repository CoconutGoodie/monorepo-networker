import { Networker } from "../../../../src";
import { CLIENT, SERVER } from "../../common/networkSides";
import { SERVER_CHANNEL } from "./networkChannel";

Networker.initialize(SERVER, SERVER_CHANNEL);

console.log("We're at", Networker.getCurrentSide().name);

async function bootstrap() {
  // ... Omitted server setup logic

  SERVER_CHANNEL.subscribe("fetchUser", (_, from, rawMessage) => {
    console.log(
      `[LOG] ${from.name} requested fetchUser(${rawMessage.payload.join(", ")})`
    );
  });

  await SERVER_CHANNEL.request(
    CLIENT,
    "execute",
    "console.log('Hello from Server')"
  );
}

bootstrap();
