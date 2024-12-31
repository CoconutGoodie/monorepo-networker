import { Networker } from "../../../../src";

export const PLUGIN = Networker.createSide("Plugin-side").listens<{
  createRectangle(width: number, height: number): string;
}>();

export const UI = Networker.createSide("Plugin-side").listens<{
  hello(text: string): void;
  focusOnElement(elementId: string): void;
}>();
