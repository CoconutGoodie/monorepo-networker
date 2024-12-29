import { MonorepoNetworker } from "../../../src";

export const UI = MonorepoNetworker.createSide<{
  focusOnSelected(): void;
  focusOnElement(elementId: string): void;
}>("UI-side");

export const CLIENT = MonorepoNetworker.createSide<{
  getClientTime(): number;
  execute(script: string): void;
  receiveUser(user: { id: string; name: string }): void;
}>("Client-side");

export const SERVER = MonorepoNetworker.createSide<{
  getServerTime(): number;
  fetchUser(userId: string): { id: string; name: string };
  markPresence(online: boolean): void;
}>("Server-side");

export const WORKER_SERVER = SERVER.extend<{
  work(): void;
}>("WorkerServer-side");
