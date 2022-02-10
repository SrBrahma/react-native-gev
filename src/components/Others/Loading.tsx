import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Portal } from '../Modals/ModalBase';



export type LoadingProps = {
  /** If should be a portal in the middle of the screen.
   * @default false */
   portal?: boolean;
   /** When using fullscreen */
   onRequestClose?: () => void;
   size?: number | 'large' | 'small' | undefined;
   text?: string;
   /** If not using fullscreen, if the loading view should flex to use all available space.
    * @default false */
   flex?: boolean;
   viewStyle?: StyleProp<ViewStyle>;
};

// Number on iOS will be 'small'. later change to a better alternative than builtin.
/** Wrapper around ActivityIndicator with extra functionalities. */
export function Loading({
  size: sizeProp, text, flex, onRequestClose, viewStyle,
  portal,
}: LoadingProps): JSX.Element {
  const { colors } = useTheme();

  const size = sizeProp ?? portal ? 80 : 60;

  const children = (<>
    <ActivityIndicator size={size} color={colors.primary}/>
    {text && <Text style={{ fontSize: 15, paddingTop: 8 }}>{text}</Text>}
  </>);

  if (portal)
    return <Portal darken viewStyle={s.center} children={children} onRequestClose={onRequestClose}/>;

  return <View style={[s.center, { flex: flex ? 1 : undefined }, viewStyle]} children={children}/>;
}

const s = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});