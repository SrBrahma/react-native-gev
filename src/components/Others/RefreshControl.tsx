import { RefreshControl as RnRefreshControl, RefreshControlProps as RnRefreshControlProps } from 'react-native';
import { useTheme } from '../../theme';



export type RefreshControlProps = RnRefreshControlProps;

/** Same as the RN component we just set the theme primaryColor to it. */
export function RefreshControl(p: RefreshControlProps): JSX.Element {
  const theme = useTheme();
  return <RnRefreshControl colors={[theme.colors.primary]} {...p}/>;
}