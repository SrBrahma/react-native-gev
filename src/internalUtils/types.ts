// https://stackoverflow.com/a/61132308/10247962
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
export type DeepPartialAndExpandable<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]> & Record<string, any>;
} : T;

export type Obj = Record<string, any>;
export type EmptyObj = Record<never, never>; // <string, never> would give a {[x: string]: never} in the Theme.

export type OmitKey<T extends Obj, K extends keyof T> = Omit<T, K>;