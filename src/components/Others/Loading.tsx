import { ActivityIndicator, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Portal } from '../Modals/ModalBase';


// Number on iOS will be 'small'. later change to a better alternative than builtin.
export function Loading({ size: sizeProp, text, fullscreen, flex, onRequestClose, viewStyle }: {
  /** If should be in the middle of the screen. Will use 'absolute'
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
}): JSX.Element {

  const { colors } = useTheme();

  const size = sizeProp ?? fullscreen ? 80 : 60;

  const children = (<>
    <ActivityIndicator size={size} color={colors.primary}/>
    {text && <Text style={{ fontSize: 15, paddingTop: 8 }}>{text}</Text>}
  </>);

  if (fullscreen)
    return (
      <Portal darken viewStyle={[{ alignItems: 'center', justifyContent: 'center' }, viewStyle]} onRequestClose={onRequestClose}>
        {children}
      </Portal>
    );

  else
    return <View style={[{ alignItems: 'center', justifyContent: 'center', flex: flex ? 1 : undefined }, viewStyle]} children={children}/>;
}