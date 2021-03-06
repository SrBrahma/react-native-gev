import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../main/theme';
import { Portal } from '../PortalsAndModals/PortalsAndModals';
import { Text } from '../Simple/Text';
import { View } from '../Simple/View';



export type LoadingProps = {
  /** If should be a portal in the middle of the screen. */
  fullscreen?: boolean;
  /** When using fullscreen */
  onRequestClose?: () => void;
  size?: number | 'large' | 'small' | undefined;
  text?: string;
  /** If not using fullscreen, if the loading view should flex to use all available space. */
  flex?: boolean;
  viewStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** The color of the Loading.
   *
   * @default theme.colors.primary */
  color?: ColorValue;
  /** Make the Loading to be absolute-positioned on the center on the parent view, above siblings and darken the background.
   *
   * Good when fetching the data of a component already being shown.
   *
   * Under the hoods it applies `...StyleSheet.absoluteFillObject` and `backgroundColor: theme.colors.backdrop` to the `viewStyle`. */
  floating?: boolean;
   /** If there will be a round background below the Loading.
    *
    * Useful when the background
    * @default false */
   //  hasBackground?: boolean

};

// Number on iOS will be 'small'. later change to a better alternative than builtin.
/** Wrapper around ActivityIndicator with extra functionalities. */
export function Loading({
  size: sizeProp, text, flex, onRequestClose, viewStyle,
  fullscreen, style, color: colorProp,
  floating,
}: LoadingProps): JSX.Element {
  const { colors } = useTheme();
  const color = colorProp ?? colors.primary;

  const size = sizeProp ?? fullscreen ? 80 : 60;

  const children = (<>
    <ActivityIndicator size={size} color={color} style={style}/>
    {text && <Text s={{ fontSize: 15, paddingTop: 8 }} t={text}/>}
  </>);

  if (fullscreen)
    return <Portal children={children} onRequestClose={onRequestClose}/>;
  else
    return <View
      center flex={flex || undefined}
      s={[
        floating && { ...StyleSheet.absoluteFillObject, backgroundColor: colors.backdrop },
        viewStyle,
      ]}
      children={children}
    />;
}