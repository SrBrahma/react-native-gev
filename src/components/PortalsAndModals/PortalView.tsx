import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import { PageScrollView } from 'pagescrollview';
import { useTheme } from '../../main';
import { Portal } from './PortalsAndModals';



export type PortalViewProps = {
  onCancel: () => void;
  /** The style of the wrapping Portal' View. Useful to change the backdrop color or the ModalView flex position. */
  portalStyle?: StyleProp<ViewStyle>;
  /** Style of the wrapping box. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style of the ScrollView that contains your children. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Won't be affected by the scroll, as children are. */
  Header?: (() => JSX.Element | null) | JSX.Element | null;
  /** Won't be affected by the scroll, as children are. */
  Footer?: (() => JSX.Element | null) | JSX.Element | null;
  /** The ScrollView props when using the innerScroll prop. */
  scrollViewProps?: ScrollViewProps;
};

export const PortalView: React.FC<PortalViewProps> = ({
  onCancel, children,
  containerStyle, portalStyle, contentStyle,
  scrollViewProps,
  Header, Footer,
}) => {
  const { colors } = useTheme();
  return (
    <Portal onRequestClose={onCancel} viewStyle={portalStyle}>
      <Pressable style={[s.container, { backgroundColor: colors.background }, containerStyle]} onPress={() => Keyboard.dismiss()}>
        {Header && (typeof Header === 'function' ? <Header/> : Header)}
        <PageScrollView flatList viewStyle={[s.content, contentStyle]} {...scrollViewProps}>
          <Pressable onPress={() => Keyboard.dismiss()}>
            {children}
          </Pressable>
        </PageScrollView>
        {Footer && (typeof Footer === 'function' ? <Footer/> : Footer)}
      </Pressable>
    </Portal>
  );
};

const s = StyleSheet.create({
  /** The box! */
  container: {
    borderRadius: 12,
    maxHeight: '80%',
    width: '80%', // TODO?
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  content: {
    // This padding because absolute stuff were being cropped
    padding: 5,
  },
});