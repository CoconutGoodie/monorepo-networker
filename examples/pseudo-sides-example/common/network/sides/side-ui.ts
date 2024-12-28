import { NetworkEvents, NetworkSide } from "../../../../../src";

interface Events extends NetworkEvents {
  focusOnSelected(): void;

  focusOnElement(elementId: string): void;
}

export const UI = new NetworkSide<Events>("UI-side");
