export type Consumer<T> = (value: T) => void;

export type AutoComplete<T, L extends string | number | symbol> =
  | L
  | Omit<T, L>;
