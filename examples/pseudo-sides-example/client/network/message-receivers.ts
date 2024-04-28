// import { EnumOf } from "../../../src2/types";
// import { AppSides } from "../common/app-network";

// function createReceiver<TSides extends EnumOf<any>>(
//   from: TSides[keyof TSides],
//   func: any
// ) {}

// export function initReceivers() {
//   createReceiver<typeof AppSides>(AppSides.SERVER, (receiveMessage) => {
//     const handleEventReceive = (event: MessageEvent) => {
//       if (event.data?.pluginId) {
//         receiveMessage(event.data.pluginMessage);
//       }
//     };

//     window.addEventListener("message", handleEventReceive);

//     return () => {
//       window.removeEventListener("message", handleEventReceive);
//     };
//   });
// }
