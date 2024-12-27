import { EnumOf, PrettifyDeep } from "./types";

/* -- Types -------------------------- */

type SealNetwork<N extends MonorepoNetworker<any, any, any, any>> = Omit<
  N,
  "build" | "defineSide" | "defineEvents" | "defineEndpoints"
>;

type SealChannel<N extends MonorepoNetworker<any, any, any, any>> = Omit<
  SealNetwork<N>,
  "initializeChannel"
>;

type ChannelRegistry<TSides extends readonly string[]> = {
  [K in TSides[number]]?: {
    [K in TSides[number]]?: Record<string, Function>;
  };
};

type ChannelFn<
  TRegistry extends ChannelRegistry<any>,
  TFrom,
  TTo
> = TFrom extends keyof TRegistry
  ? TTo extends keyof TRegistry[TFrom]
    ? TRegistry[TFrom][TTo]
    : never
  : never;

interface ChannelOptions<TSides extends readonly string[], TSide> {
  side: TSide;
  transports: {
    [K in Exclude<TSides[number], TSide> as K extends string
      ? `${Capitalize<K>}`
      : never]?: {
      attachMessageListener?: Function;
      detachMessageListener?: Function;
      emitMessage?: Function;
    };
  };
}

/* -- Impl -------------------------- */

export class MonorepoNetworker<
  TSides extends readonly string[] = [],
  TCurrentSide extends TSides[number] = never,
  TEventMessages extends ChannelRegistry<TSides> = {},
  TRequestMessages extends ChannelRegistry<TSides> = {}
> {
  public Side: EnumOf<TSides>;

  private _currentSide: TSides[number];
  private _channelOptions: ChannelOptions<TSides, TCurrentSide>;

  public defineSide<S extends Capitalize<string>>(sideName: S) {
    this.Side[sideName.toUpperCase()] = sideName;

    return this as any as MonorepoNetworker<[...TSides, S]>;
  }

  public defineEvents<
    TFrom extends TSides[number],
    TTo extends Exclude<TSides[number], TFrom>
  >(_: { from: TFrom; to: TTo }) {
    return <TFuncs extends Record<string, Function>>() => {
      return this as MonorepoNetworker<
        TSides,
        TCurrentSide,
        PrettifyDeep<TEventMessages & Record<TFrom, Record<TTo, TFuncs>>>,
        TRequestMessages
      >;
    };
  }

  public defineEndpoints<
    TFrom extends TSides[number],
    TTo extends Exclude<TSides[number], TFrom>
  >(_: { requester: TFrom; responder: TTo }) {
    return <TFuncs extends Record<string, Function>>() => {
      return this as MonorepoNetworker<
        TSides,
        TCurrentSide,
        TEventMessages,
        PrettifyDeep<TRequestMessages & Record<TFrom, Record<TTo, TFuncs>>>
      >;
    };
  }

  public build() {
    return this as SealNetwork<typeof this>;
  }

  /* ------------ */

  public initializeChannel<TSide extends typeof this._currentSide>(
    options: ChannelOptions<TSides, TSide>
  ) {
    const newThis = this as any as MonorepoNetworker<
      TSides,
      TSide,
      TEventMessages,
      TRequestMessages
    >;
    if (this._currentSide != null)
      throw new Error("Network for this side is already initialized.");
    newThis._currentSide = options.side;
    newThis._channelOptions = options;

    return newThis as SealChannel<typeof newThis>;
  }

  /* ------------ */

  public dispatchEvent<
    TToSide extends Capitalize<Exclude<TSides[number], TCurrentSide>> = never,
    TEventName extends keyof ChannelFn<
      TEventMessages,
      TCurrentSide,
      TToSide
    > = never,
    TEventMessage = ChannelFn<TEventMessages, TCurrentSide, TToSide>[TEventName]
  >(
    toSide: TToSide,
    eventName: TEventName,
    ...args: TEventMessage extends (...args: any) => any
      ? Parameters<TEventMessage>
      : never
  ) {
    // const transports = this._channelOptions.transports[toSide];
  }

  public request<
    TResponderSide extends Exclude<TSides[number], TCurrentSide> = never,
    TEventName extends keyof ChannelFn<
      TRequestMessages,
      TCurrentSide,
      TResponderSide
    > = never,
    TEventMessage = ChannelFn<
      TRequestMessages,
      TCurrentSide,
      TResponderSide
    >[TEventName]
  >(
    responderSide: TResponderSide,
    eventName: TEventName,
    ...args: TEventMessage extends (...args: any) => any
      ? Parameters<TEventMessage>
      : never
  ) {
    return null as any as Promise<
      TEventMessage extends (...args: any) => any
        ? ReturnType<TEventMessage>
        : never
    >;
  }
  
  public addEventListener<
    TFromSide extends Exclude<TSides[number], TCurrentSide> = never,
    TEventName extends keyof ChannelFn<
      TEventMessages,
      TFromSide,
      TCurrentSide
    > = never,
    TEventMessage = ChannelFn<
      TEventMessages,
      TFromSide,
      TCurrentSide
    >[TEventName]
  >(fromSide: TFromSide, eventName: TEventName, callback: TEventMessage) {}

  public addRequestHandler<
    TFromSide extends Exclude<TSides[number], TCurrentSide> = never,
    TRequestName extends keyof ChannelFn<
      TRequestMessages,
      TFromSide,
      TCurrentSide
    > = never,
    TRequestMessage = ChannelFn<
      TRequestMessages,
      TFromSide,
      TCurrentSide
    >[TRequestName]
  >(
    fromSide: TFromSide,
    eventName: TRequestName,
    handler: (
      ...args: any[]
    ) => TRequestMessage extends (...args: any) => any
      ? ReturnType<TRequestMessage>
      : never
  ) {}
}
