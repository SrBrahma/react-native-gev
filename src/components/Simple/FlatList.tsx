import type { FlatListProps as RnFlatListProps } from 'react-native';
import { FlatList as RnFlatList } from 'react-native';
import { RefreshControl } from './RefreshControl';



export type FlatListProps<ItemT = any> = RnFlatListProps<ItemT>;

/** Same as the FlatList, but also:
 * * Has RefreshControl with theme.colors.primary as `colors`. To use it, use `onRefresh` and `refreshing` properties.
 */
// * * Applies the theme's backgroundColor.
export function FlatList({ refreshing, onRefresh, ...p }: FlatListProps): JSX.Element {
  return <RnFlatList
    refreshControl={onRefresh ? (<RefreshControl onRefresh={onRefresh} refreshing={refreshing ?? false}/>) : undefined}
    {...p}
  />;
}