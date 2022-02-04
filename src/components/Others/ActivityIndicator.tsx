import { ActivityIndicator as RnActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { useTheme } from '../../theme';


/** Same as the RN component we just set the theme primaryColor to it. */
export function ActivityIndicator(p: ActivityIndicatorProps): JSX.Element {
  const theme = useTheme();
  return <RnActivityIndicator color={theme.colors.primary} {...p}/>;
}