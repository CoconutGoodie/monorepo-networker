import * as Networker from "../../../../src";
import { NetworkSide } from "../sides";

interface Payload {
  title?: string;
  body: string;
}

type Response = "OK" | "FAILED";

export class DisplayPopupMessage extends Networker.MessageType<
  Payload,
  Response
> {
  public receivingSide(): Networker.Side {
    return NetworkSide.UI;
  }

  public handle(payload: Payload, from: Networker.Side): Response {
    console.log(
      `${from.getName()} asked to display: [${payload.title ?? "Untitled"}](${
        payload.body
      })`
    );
    return "OK";
  }
}
