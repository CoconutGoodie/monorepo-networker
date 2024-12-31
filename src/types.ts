export interface NetworkEvents {
  [eventName: string]: (...args: any[]) => any;
}

export interface NetworkMessage {
  /** UUIDv4 ID issues for this message */
  messageId: string;
  /** Name of the logical side, which created this message */
  fromSide: string;
  /** Name of the event */
  eventName: string;
  /** Arguments of the event */
  payload: any[];
}
