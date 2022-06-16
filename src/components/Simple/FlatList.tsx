import type { FlatListProps as RnFlatListProps } from 'react-native';
import { FlatList as RnFlatList } from 'react-native';
import { RefreshControl } from './RefreshControl';



export type FlatListProps<ItemT = any> = RnFlatListProps<ItemT>;

/** Same as the FlatList, but also:
 * * Has RefreshControl with theme.colors.primary as `colors`. To use it, use `onRefresh` and `refreshing` properties.
 */
export function FlatList<T>({ refreshing, onRefresh, ...p }: FlatListProps<T>): JSX.Element {
  return <RnFlatList
    // We could (onRefresh || refreshing), but without onRefresh it allows pull to refresh without doing anything.
    refreshControl={onRefresh ? (<RefreshControl onRefresh={onRefresh} refreshing={refreshing ?? false}/>) : undefined}
    {...p}
  />;
}