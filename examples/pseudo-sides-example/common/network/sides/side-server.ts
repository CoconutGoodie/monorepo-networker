import { NetworkEvents, NetworkSide } from "../../../../../src";

interface Events extends NetworkEvents {
  getServerTime(): number;

  fetchUser(userId: string): {
    id: string;
    name: string;
  };

  markPresence(online: boolean): void;
}

export const SERVER = new NetworkSide<Events>("Server-side");
