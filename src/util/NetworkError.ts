import { NetworkMessage } from "../types";

export class NetworkError extends Error {
  constructor(message: NetworkMessage) {
    super(message.payload[0]);
  }
}
