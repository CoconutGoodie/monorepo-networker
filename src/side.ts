import { ChannelConfig, NetworkChannel } from "./channel";

export interface NetworkEvents {
  [eventName: string]: (...args: any[]) => any;
}

export class NetworkSide<T extends NetworkEvents> {
  constructor(public readonly name: string) {}

  public extend<TE extends NetworkEvents>(name: string) {
    return new NetworkSide<T & TE>(name);
  }

  public createChannel(config?: ChannelConfig) {
    const channel = new NetworkChannel(this, config);
    return channel;
  }
}
