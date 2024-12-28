import { NetworkEvents, NetworkSide } from "../../../../../src";

interface Events extends NetworkEvents {
  getClientTime(): number;

  execute(script: string): void;
}

export const CLIENT = new NetworkSide<Events>("Client-side");
