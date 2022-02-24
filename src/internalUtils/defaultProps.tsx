import { StyleSheet } from 'react-native';
import type { Obj } from './types';



/** Merges the props and the indicated styles. */
export function propsMerger<T extends Record<string, any>>({ props, stylesKeys = [] }: {
  props: (Partial<T> | null | undefined)[];
  stylesKeys?: (keyof T)[];
}): T {
  const styles: Partial<T> = {};
  for (const key of stylesKeys)
    styles[key] = StyleSheet.flatten(props.map((p) => p?.[key])) as any;
  return {
    ...props.reduce((obj, p) => ({ ...obj, ...p } as T), {} as T) as T,
    ...styles,
  };
}

/** If defaultProp it's a function, then returns its return. */
export function useGetDefaultProps<T extends Obj>(param: T | (() => T)): T {
  return typeof param === 'function' ? param() : param;
}

/** For T, returns T | (() => T) */
export type MayBeFunction<T> = T | (() => T);

// export function usePropsMerger<T extends Record<string, unknown>>({ props, stylesKeys }: {
//   props: (T | null | undefined)[];
//   stylesKeys?: string[];
// }): T {
//   return useMemo(() => propsMerger({ props, stylesKeys }), [props, stylesKeys]);
// }