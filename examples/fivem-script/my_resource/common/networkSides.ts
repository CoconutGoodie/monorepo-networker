import { Networker } from "../../../../src";

export const NUI = Networker.createSide("NUI-side").listens<{
  displayGpsWaypoint(x: number, y: number, color: string): void;
}>();

export const CLIENT = Networker.createSide("Client-side").listens<{
  updatePlayerLocation(x: number, y: number): void;
}>();

export const SERVER = Networker.createSide("Server-side").listens<{
  fetchPlayerLocation(): [x: number, y: number];
  createWaypoint(x: number, y: number): void;
}>();
