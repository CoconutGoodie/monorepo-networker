import { EnumOf, PrettifyDeep } from "./types";

/* -- Types -------------------------- */

type Sealed<TNetwork extends MonorepoNetworker<any>> = Omit<
  TNetwork,
  "build" | "defineSide" | "defineEvents" | "defineEndpoints"
>;

type ChannelRegistry<TSides extends readonly string[]> = {
  [K in TSides[number]]?: {
    [K in TSides[number]]?: Record<string, Function>;
  };
};

/* -- Impl -------------------------- */

export class MonorepoNetworker<
  TSides extends readonly string[] = [],
  TEventMessages extends ChannelRegistry<TSides> = {},
  TRequestMessages extends ChannelRegistry<TSides> = {}
> {
  public Side: Readonly<EnumOf<TSides>>;

  private _currentSide: TSides[number];
  get currentSide() {
    return this._currentSide;
  }

  public defineSide<S extends Capitalize<string> = "">(sideName: S) {
    this.Side[sideName.toUpperCase()] = sideName;

    return this as any as MonorepoNetworker<[...TSides, S]>;
  }

  public defineEvents<
    TFrom extends TSides[number],
    TTo extends Exclude<TSides[number], TFrom>
  >(_: { from: TFrom; to: TTo }) {
    return <TFuncs extends Record<string, Function>>() => {
      return this as any as MonorepoNetworker<
        TSides,
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
      return this as any as MonorepoNetworker<
        TSides,
        TEventMessages,
        PrettifyDeep<TRequestMessages & Record<TFrom, Record<TTo, TFuncs>>>
      >;
    };
  }

  public build() {
    return this as Sealed<typeof this>;
  }

  /* ------------ */

  public initialize<TSide extends typeof this._currentSide>(
    currentSide: TSide,
    options: {
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
  ) {
    if (this._currentSide != null)
      throw new Error("Network for this side is already initialized.");
    this._currentSide = currentSide;
  }

  /* ------------ */

  // public dispatch<TSide extends TSides[number]>(toSide:TSide, ,eventName: any) {}
}
