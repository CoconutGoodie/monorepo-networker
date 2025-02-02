import { CLIENT, SERVER, UI } from "../../common/networkSides";

import http, { IncomingMessage, ServerResponse } from "node:http";
import { NetworkMessage } from "../../../../src";
import { getHttpBody } from "./util/httpUtils";

let contexts: Map<
  string,
  {
    req: IncomingMessage;
    res: ServerResponse;
  }
> = new Map();

function emitResponse(message: NetworkMessage) {
  const ctx = contexts.get(message.messageId);
  if (!ctx) return;

  ctx.res.setHeader("Content-Type", "application/json");
  ctx.res.end(JSON.stringify(message));
  contexts.delete(message.messageId);
}

export const SERVER_CHANNEL = SERVER.channelBuilder()
  .emitsTo(CLIENT, emitResponse)
  .emitsTo(UI, emitResponse)
  .receivesFrom(CLIENT, (next) => {
    const server = http.createServer((req, res) => {
      getHttpBody(req).then((message: NetworkMessage) => {
        contexts.set(message.messageId, { req, res });
        next(message);
      });
    });

    server.listen(3000);

    return () => {
      server.close();
    };
  })
  .startListening();

// ----------- Message Handlers

const users = {
  "USER-1": { id: "USER-1", name: "User 1", present: false },
  "USER-2": { id: "USER-2", name: "User 2", present: true },
};

SERVER_CHANNEL.registerMessageHandler(
  "fetchUser",
  (userId, _, { messageId }) => {
    const ctx = contexts.get(messageId);
    if (!ctx) throw new Error("Context is not set...");

    const user = users[userId];

    return (
      user || {
        id: "USER-0",
        name: "Unknown User",
      }
    );
  }
);

SERVER_CHANNEL.registerMessageHandler("getServerTime", () => Date.now());

SERVER_CHANNEL.registerMessageHandler("markPresence", async (online) => {
  return new Promise<void>((resolve) => {
    // Pseudo-delay to demonstrate async message handler
    setTimeout(() => {
      users["USER-1"].present = online;
      resolve();
    }, 2000);
  });
});
