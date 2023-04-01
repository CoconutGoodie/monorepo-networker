import * as Networker from "../../../src/index";
import { DisplayPopupMessage } from "./messages/DisplayPopupMessage";

export namespace NetworkMessages {
  export const registry = new Networker.MessageTypeRegistry();

  export const DISPLAY_POPUP = registry.register(
    new DisplayPopupMessage("display-popup")
  );
}
