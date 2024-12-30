import { MonorepoNetworker } from "../../../../src";

export const PLUGIN = MonorepoNetworker.createSide<{
  createRectangle(width: number, height: number): string;
}>("Plugin-side");

export const UI = MonorepoNetworker.createSide<{
  hello(text: string): void;
  focusOnElement(elementId: string): void;
}>("Plugin-side");
