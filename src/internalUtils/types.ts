// https://stackoverflow.com/a/61132308
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
export type DeepPartialAndExpandable<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]> & Record<string, any>;
} : T;

export type Obj = Record<string, any>;
export type EmptyObj = Record<never, never>; // <string, never> would give a {[x: string]: never} in the Theme.

export type OmitKey<T extends Obj, K extends keyof T> = Omit<T, K>;

// https://stackoverflow.com/a/59846133
export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

/** For T, returns T | (() => T) */
export type MayBeFunction<T, Param = any> = T | ((params: Param) => T);