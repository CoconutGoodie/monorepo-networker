import { NetworkChannel } from "./channel";
import { NetworkEvents, NetworkSide } from "./side";

export class MonorepoNetworker {
  private static _sides: NetworkSide<any>[] = [];
  private static _currentSide: NetworkSide<any>;

  public static get currentSide() {
    if (MonorepoNetworker._currentSide == null) {
      throw new Error("Logical side is not initialized yet.");
    }
    return MonorepoNetworker._currentSide;
  }
  public static set currentSide(side) {
    if (MonorepoNetworker._currentSide != null) {
      throw new Error("Logical side can be declared only once.");
    }
    MonorepoNetworker._currentSide = side;
  }

  public static initialize<T extends NetworkEvents>(
    side: NetworkSide<T>,
    handler: NetworkChannel<T, any>
  ) {
    MonorepoNetworker.currentSide = side;
    handler["init"]();
  }

  public static createSide<TEvents extends NetworkEvents>(name: string) {
    const side = new NetworkSide<TEvents>(name);
    this._sides.push(side);
    return side;
  }

  public static getSide(name: string) {
    for (let side of this._sides) {
      if (side.name === name) return side;
    }
    return null;
  }
}
