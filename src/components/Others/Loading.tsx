import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../main/theme';
import { Portal } from '../Modals/ModalBase';
import { Text } from '../Simple/Text';
import { View } from '../Simple/View';



export type LoadingProps = {
  /** If should be a portal in the middle of the screen.
   * @default false */
   fullscreen?: boolean;
   /** When using fullscreen */
   onRequestClose?: () => void;
   size?: number | 'large' | 'small' | undefined;
   text?: string;
   /** If not using fullscreen, if the loading view should flex to use all available space.
    * @default false */
   flex?: boolean;
   viewStyle?: StyleProp<ViewStyle>;
   style?: StyleProp<ViewStyle>;
   /** The color of the Loading.
    *
    * @default theme.colors.primary */
   color?: ColorValue;
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

  return <View center flex={!!flex} s={[s.center, { flex: flex ? 1 : undefined }, viewStyle]} children={children}/>;
}

const s = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});