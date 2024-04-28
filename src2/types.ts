export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type PrettifyDeep<T> = {
  [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
} & unknown;

export type EnumOf<T extends readonly string[]> = Prettify<{
  [K in T[number] as Uppercase<K>]: K;
}>;
