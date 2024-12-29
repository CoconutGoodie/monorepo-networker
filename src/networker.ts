import { NetworkChannel } from "./channel";
import { NetworkSide } from "./side";
import { NetworkEvents } from "./types";

export namespace MonorepoNetworker {
  const _sides: NetworkSide<any>[] = [];
  let _currentSide: NetworkSide<any> | undefined;

  /**
   * @throws Will throw an error, if this logical side is not initialized yet.
   * @returns Current logical side
   */
  export function getCurrentSide() {
    if (_currentSide == null) {
      throw new Error("Logical side is not initialized yet.");
    }
    return _currentSide;
  }

  /**
   * Initializes the side into given channel, effectively invoking the channel's `attachListener`.
   *
   * **NOTE:** This MUST be called, before any emit/request can be called from the channel
   * @param side Side object created by `MonorepoNetwork.createSide`
   * @param channel Side specific Channel, created by `SIDE.createNetwork`
   */
  export function initialize<T extends NetworkEvents>(
    side: NetworkSide<T>,
    channel: NetworkChannel<T, any>
  ) {
    if (_currentSide != null) {
      throw new Error("Logical side can be declared only once.");
    }
    _currentSide = side;
    channel["init"]();
  }

  /**
   * Creates a "side" representation that holds the events it can handle/listen.
   * @param name Display name of the side
   * @returns A lightweight/shareable representation of the logical side
   */
  export function createSide<TEvents extends NetworkEvents>(name: string) {
    const side = new NetworkSide<TEvents>(name);
    _sides.push(side);
    return side;
  }

  /**
   * Attempts to lookup the side, by its name.
   * @param name Name of the logical side
   * @returns Side with given name
   */
  export function getSide(name: string) {
    for (let side of _sides) {
      if (side.name === name) return side;
    }
    return null;
  }
}
