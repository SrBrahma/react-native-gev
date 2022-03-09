import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { MayBeFunction, Obj, OmitKey } from './types';



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
export function useGetThemeDefaultProps<T extends Obj, C extends Obj>({ themeProps, componentProps }: {
  /** If `themeProps` is a function, this will be passed as argument to it. */
  componentProps: C;
  themeProps: T | ((componentProps: C) => T);
}): T {
  return useMemo(() => {
    return typeof themeProps === 'function'
      ? (themeProps as any)(componentProps)
      : themeProps;
  }, [componentProps, themeProps]);
}

export type ThemeProps<ComponentProps extends Obj, KeysToOmit extends string> = MayBeFunction<Partial<OmitKey<ComponentProps, KeysToOmit>>, ComponentProps>;

// export function usePropsMerger<T extends Record<string, unknown>>({ props, stylesKeys }: {
//   props: (T | null | undefined)[];
//   stylesKeys?: string[];
// }): T {
//   return useMemo(() => propsMerger({ props, stylesKeys }), [props, stylesKeys]);
// }