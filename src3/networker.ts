import { NetworkHandler } from "./handler";
import { AcceptedEvents, NetworkSide } from "./side";

export class MonorepoNetworker {
  private static _currentSide: NetworkSide<any>;

  public static get currentSide() {
    return MonorepoNetworker._currentSide;
  }
  public static set currentSide(side) {
    if (MonorepoNetworker._currentSide != null) {
      throw new Error("Logical side can be declared only once.");
    }
    MonorepoNetworker._currentSide = side;
  }

  public static initialize<T extends AcceptedEvents>(
    side: NetworkSide<T>,
    handler: NetworkHandler<T, any>
  ) {
    MonorepoNetworker.currentSide = side;
  }
}
