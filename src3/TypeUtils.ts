type MethodsReturning<TObject extends object, TTarget> = {
  [K in keyof TObject]: TObject[K] extends (...args: any[]) => infer R
    ? [R] extends [TTarget]
      ? never
      : K
    : never;
}[keyof TObject];

export type TrimMethodsReturning<TObject extends object, TTarget> = {
  [K in MethodsReturning<TObject, TTarget>]: TObject[K];
};
