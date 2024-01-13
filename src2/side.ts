// TODO: Change when internal handler is reimplemented
type OnMessageReceived = (message: { id: 1 }) => void;

const sides = new Map<string, NetworkerSide>();

class NetworkerSide<TCleanup extends (() => void) | void = any> {
  constructor(
    private name: string,
    private attachMessageReceiver: (
      receiveMessage: OnMessageReceived
    ) => TCleanup
  ) {}
}

/* -------------------- */

namespace AppSides {
  export const CLIENT = new NetworkerSide("Client", (receiveMessage) => {
    const handleEventReceive = (event: MessageEvent) => {
      if (event.data?.pluginId) {
        receiveMessage(event.data.pluginMessage);
      }
    };

    window.addEventListener("message", handleEventReceive);

    return () => {
      window.removeEventListener("message", handleEventReceive);
    };
  });

  export const SERVER = new NetworkerSide("Server", (receiveMessage) => {
    // const handleEventReceive = (event: MessageEvent) => {
    //   receiveMessage(event.data);
    // };
    // window.addEventListener("message", handleEventReceive);
    // return () => {
    //   window.removeEventListener("message", handleEventReceive);
    // };
  });
}
