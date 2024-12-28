export interface AcceptedEvents {
  [eventName: string]: (...args: any[]) => any;
}

export class NetworkSide<T extends AcceptedEvents> {
  constructor(public readonly name: string) {}

  public extend<TE extends AcceptedEvents>(name: string) {
    return new NetworkSide<T & TE>(name);
  }
}
