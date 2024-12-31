import { NetworkChannelBuilder } from "./channel";
import { NetworkEvents } from "./types";

export class NetworkSide<N extends string, T extends NetworkEvents> {
  constructor(public readonly name: N) {}

  public extend<NE extends string, TE extends NetworkEvents>(name: NE) {
    return new NetworkSide<NE, T & TE>(name);
  }

  // public createChannel<C extends ChannelConfig>(config: C) {
  //   return new NetworkChannel<T, {}>(this, config);
  // }

  public channelBuilder() {
    return new NetworkChannelBuilder<T, {}>(this);
  }
}
