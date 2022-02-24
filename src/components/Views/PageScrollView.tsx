import type { PageScrollViewProps as OriginalPageScrollViewProps } from 'pagescrollview';
import { PageScrollView as OriginalPageScrollView } from 'pagescrollview';
import { useTheme } from '../../main/theme';
import { RefreshControl } from '../Others/RefreshControl';



export type PageScrollViewProps = OriginalPageScrollViewProps & {
  onRefresh?: () => void;
  refreshing?: boolean;
};

/** Same as the PageScrollView, another package of mine for basically a ScrollView with common bugfixes, but also:
 * * Applies the theme's backgroundColor.
 * * Adds `refreshing` and `onRefresh` props as shortcut to RefreshControl, with themes's primaryColor as its color.
 */
export const PageScrollView: React.FC<PageScrollViewProps> = ({ refreshing, onRefresh, viewStyle, ...p }) => {
  const theme = useTheme();
  const backgroundColor = theme.colors.background;
  return <OriginalPageScrollView
    refreshControl={onRefresh ? (<RefreshControl onRefresh={onRefresh} refreshing={refreshing ?? false}/>) : undefined}
    viewStyle={[{ backgroundColor }, viewStyle]}
    {...p}
  />;
};