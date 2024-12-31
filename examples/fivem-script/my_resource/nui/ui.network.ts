import { CLIENT, NUI } from "@common/networkSides";

declare function GetParentResourceName(): string;

export const NUI_CHANNEL = NUI.channelBuilder()
  .emitsTo(CLIENT, (message) => {
    fetch(
      `https://${GetParentResourceName}/__MonorepoNetworker_nuiToClientRpc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(message),
      }
    );
  })
  .receivesFrom(CLIENT, (next) => {
    const listener = (event: MessageEvent) => {
      next(event.data);
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  })
  .startListening();

// ----------- Message Handlers
