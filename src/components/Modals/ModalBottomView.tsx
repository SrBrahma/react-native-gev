import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../main/theme';
import { PageScrollView } from '../Views/PageScrollView';
import { Portal } from './ModalBase';



export type ModalBottomViewProps = {
  title?: string;
  onCancel?: () => void;
  /** Style of the wrapping box. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style of the ScrollView that contains your children. */
  childrenContentStyle?: StyleProp<ViewStyle>;
  /** Won't be affected by the scroll, as children are */
  Header?: (() => JSX.Element) | JSX.Element;
  /** Won't be affected by the scroll, as children are */
  Footer?: (() => JSX.Element) | JSX.Element;
  /** If your children will be wrapped by a ScrollView.
   * @default true */
  innerScroll?: boolean;
  /** The ScrollView props when using the innerScroll prop. */
  scrollViewProps?: ScrollViewProps;
};
export const ModalBottomView: React.FC<ModalBottomViewProps> = ({
  onCancel, children, containerStyle,
  childrenContentStyle, innerScroll, scrollViewProps,
  Header, Footer,
}) => {
  const theme = useTheme();
  const inner = (
    // Without this internal pressable (RN 0.64), the scroll rarely works. https://stackoverflow.com/a/57960538/10247962
    <Pressable onPress={() => Keyboard.dismiss()}>
      {children}
    </Pressable>
  );

  return (
    <Portal onRequestClose={onCancel} viewStyle={s.back}>
      <Pressable style={[s.container, theme.sizes.screen, containerStyle]}>
        {Header && (typeof Header === 'function' ? <Header/> : Header)}
        {/* This padding because absolute stuff were being cropped */}
        {innerScroll
          ? <PageScrollView viewStyle={childrenContentStyle} {...scrollViewProps} children={inner}/>
          : <View style={childrenContentStyle} children={inner}/>
        }
        {Footer && (typeof Footer === 'function' ? <Footer/> : Footer)}
      </Pressable>
    </Portal>
  );
};

const s = StyleSheet.create({
  /** The back grey */
  back: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  /** The box! */
  container: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignSelf: 'center',
    // maxHeight: '70%',
    width: '100%',
  },
});