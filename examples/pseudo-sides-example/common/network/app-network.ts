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
  }>()

  .defineEvents({ from: "UI", to: "Client" })<{
    createSquare(len: number): void;
  }>()

  .defineEndpoints({ requester: "Client", responder: "Server" })<{
    getServerTime(): number;
    getServerVersion(): string;
    getUser(userId: string): { username: string };
  }>()

  .build();

// client.ts

AppNetwork.initialize(AppNetwork.Side.CLIENT, {
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

// AppNetwork.dispatch("Client");
