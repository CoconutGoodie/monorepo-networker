import { NetworkMessage, NetworkSide } from "../../../../src";
import { Side } from "../sides";

interface Payload {
  title?: string;
  body: string;
}

type Response = "OK" | "FAILED";

export class DisplayPopupMessage extends NetworkMessage<Payload, Response> {
  public receivingSide(): NetworkSide<any> {
    return Side.UI;
  }

  public handle(payload: Payload, from: NetworkSide<any>): Response {
    console.log(
      `${from.getName()} asked to display: [${payload.title ?? "Untitled"}](${
        payload.body
      })`
    );
    return "OK";
  }
}
