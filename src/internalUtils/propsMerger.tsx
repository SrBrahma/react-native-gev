import { StyleSheet } from 'react-native';




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



// export function usePropsMerger<T extends Record<string, unknown>>({ props, stylesKeys }: {
//   props: (T | null | undefined)[];
//   stylesKeys?: string[];
// }): T {
//   return useMemo(() => propsMerger({ props, stylesKeys }), [props, stylesKeys]);
// }