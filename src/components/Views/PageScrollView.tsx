import { PageScrollView as OriginalPageScrollView, PageScrollViewProps } from 'pagescrollview';
import { useTheme } from '../../main/theme';



export { PageScrollViewProps };
/** Same as the PageScrollView, another package of mine, but applies the theme's backgroundColor is applied. */
export const PageScrollView: React.FC<PageScrollViewProps> = (p) => {
  const theme = useTheme();
  return <OriginalPageScrollView backgroundColor={theme.colors.background} {...p}/>;
};