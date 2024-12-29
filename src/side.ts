import { ChannelConfig, NetworkChannel } from "./channel";
import { NetworkEvents } from "./types";

export class NetworkSide<T extends NetworkEvents> {
  constructor(public readonly name: string) {}

  public extend<TE extends NetworkEvents>(name: string) {
    return new NetworkSide<T & TE>(name);
  }

  public createChannel<C extends ChannelConfig>(config: C) {
    return new NetworkChannel<T, C>(this, config);
  }
}
