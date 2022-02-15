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

  const inner = () => (
    // Without this internal pressable (RN 0.64), the scroll rarely works. https://stackoverflow.com/a/57960538/10247962
    <Pressable onPress={() => Keyboard.dismiss()}>
      {children}
    </Pressable>
  );

  const theme = useTheme();

  return (
    <Portal
      onRequestClose={onCancel}
      viewStyle={s.back}
      darken
    >
      {/* ScrollView would throw VirtualizedLists should never be nested inside plain ScrollViews, if having an inner FlatList as children. */}
      {/* We need the scroll to have keyboardShouldPersistTaps */}
      {/* <FlatList
        overScrollMode='never'
        bounces={false}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flex: 1 }} // make the back grey spread to all screen
        nestedScrollEnabled
        data={[1]} keyExtractor={() => '1'}
        renderItem={() => ( */}
      {/* <Pressable onPress={onCancel} style={s.back}> */}
      {/* Pressable inside to ignore touches inside. Dismiss needed here for some reason to blur input */}
      <Pressable style={[s.container, theme.sizes.screen, containerStyle]}>
        {Header && (typeof Header === 'function' ? <Header/> : Header)}
        {/* This padding because absolute stuff were being cropped */}
        {innerScroll && <PageScrollView viewStyle={[s.childrenContent, childrenContentStyle]} nestedScrollEnabled {...scrollViewProps} children={inner()}/>}
        {!innerScroll && <View style={[s.childrenContent, childrenContentStyle]} children={inner()}/>}
        {Footer && (typeof Footer === 'function' ? <Footer/> : Footer)}
      </Pressable>
      {/* </Pressable> */}
      {/* )}/> */}
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
  childrenContent: {
  },
});


// export function modalView(Component: (ModalView: React.FC<ModalViewProps>) => JSX.Element): void {
//   const component = <ModalView {...props} onCancel={() => {removeModal(component); props.onCancel?.();}}/>;

//   addModal(component);
// }