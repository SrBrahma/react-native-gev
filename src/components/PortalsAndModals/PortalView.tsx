import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import { PageScrollView } from 'pagescrollview';
import type { OmitKey } from '../../internalUtils/types';
import { useTheme } from '../../main';
import type { PortalProps } from './PortalsAndModals';
import { Portal } from './PortalsAndModals';



export type PortalViewProps = OmitKey<PortalProps, 'style'> & {
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
  /** Same as children, but better if you are using Header and/or Footer.
   *
   * As children, it's first wrapped by a Pressable and then by a ScrollView. */
  Body?: (() => JSX.Element | null) | JSX.Element | null;
  /** The ScrollView props when using the innerScroll prop. */
  scrollViewProps?: ScrollViewProps;
  children?: React.ReactNode;
};
// TODO can use header and footer from PageScrollView, now a FlatList.
// Actually it uses Footer. Maybe convert it to use children to allow us to use those two?
export function PortalView({
  children,
  containerStyle, portalStyle, contentStyle,
  scrollViewProps,
  Header, Body, Footer,
  ...portalProps
}: PortalViewProps): JSX.Element {
  const { colors } = useTheme();
  return (
    <Portal style={portalStyle} {...portalProps}>
      <Pressable style={[s.container, { backgroundColor: colors.background }, containerStyle]} onPress={() => Keyboard.dismiss()}>
        {Header && (typeof Header === 'function' ? <Header/> : Header)}
        <PageScrollView style={contentStyle} {...scrollViewProps}>
          <Pressable onPress={() => Keyboard.dismiss()}>
            {Body ?? children}
          </Pressable>
        </PageScrollView>
        {Footer && (typeof Footer === 'function' ? <Footer/> : Footer)}
      </Pressable>
    </Portal>
  );
}

const s = StyleSheet.create({
  /** The box! */
  container: {
    borderRadius: 12,
    maxHeight: '80%',
    width: '80%', // TODO?
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
});