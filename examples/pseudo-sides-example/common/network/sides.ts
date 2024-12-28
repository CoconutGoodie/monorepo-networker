import { NetworkSide } from "../../../../src";

export const UI = new NetworkSide<{
  focusOnSelected(): void;
  focusOnElement(elementId: string): void;
}>("UI-side");

export const CLIENT = new NetworkSide<{
  getClientTime(): number;
  execute(script: string): void;
}>("Client-side");

export const SERVER = new NetworkSide<{
  getServerTime(): number;
  fetchUser(userId: string): { id: string; name: string };
  markPresence(online: boolean): void;
}>("Server-side");

export const WORKER_SERVER = SERVER.extend<{
  work(): void;
}>("WorkerServer-side");
