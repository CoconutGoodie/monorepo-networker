import { MonorepoNetworker } from "../../../../src2";

export const AppNetwork = new MonorepoNetworker()
  .defineSide("Server")
  .defineSide("Client")
  .defineSide("UI")

  .defineEvents({ from: "Server", to: "Client" })<{
    execute(script: string): void;
  }>()

  .defineEvents({ from: "Client", to: "UI" })<{
    focusOnSelected(): void;
    focusOnElement(elementId: string): void;
  }>()

  .defineEvents({ from: "UI", to: "Client" })<{
    createSquare(length: number): void;
  }>()

  .defineEndpoints({ requester: "Client", responder: "Server" })<{
    getServerTime(): number;
    getServerVersion(): string;
    getUser(userId: string): { username: string };
  }>()

  .build();

// client/network/channel.ts

export const ClientChannel = AppNetwork.initializeChannel({
  side: AppNetwork.Side.CLIENT,
  transports: {
    Server: {
      attachMessageListener: (callback) => {
        window.addEventListener("message", callback);
      },
      detachMessageListener: (callback) => {
        window.removeEventListener("message", callback);
      },
      emitMessage: (messagePayload) => {
        parent.postMessage({ pluginMessage: messagePayload }, "*");
      },
    },
    UI: {
      emitMessage: (messagePayload) =>
        console.log("Sending to UI", messagePayload),
    },
  },
});

// server/network/channel.ts

export const ServerChannel = AppNetwork.initializeChannel({
  side: "Server",
  transports: {},
});

ServerChannel.addRequestHandler("Client", "getUser", (userId) => {
  console.log("LOOKUP", userId);
  return {
    username: "1234",
  };
});

// client/client.ts

async function bootstrap() {
  ClientChannel.dispatchEvent("UI", "focusOnSelected");
  ClientChannel.dispatchEvent("UI", "focusOnElement", "ABC-01");

  ClientChannel.addEventListener("Server", "execute", (script) => {
    console.log("EXEC", script);
  });

  ClientChannel.request("Server", "getUser", "USR-01")
    .then((user) => console.log(user.username))
    .catch((err) => console.log(err));
}

bootstrap();
