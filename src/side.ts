import { NetworkChannelBuilder } from "./channel";
import { NetworkEvents } from "./types";

export class NetworkSide<N extends string, T extends NetworkEvents> {
  constructor(public readonly name: N) {}

  public channelBuilder(): NetworkChannelBuilder<T, {}> {
    return new NetworkChannelBuilder<T, {}>(this);
  }
}
