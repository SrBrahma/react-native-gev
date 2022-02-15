import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { FlatList, Keyboard, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../main/theme';
import { PageScrollView } from '../Views/PageScrollView';



export type ModalViewProps = {
  onCancel: () => void;
  /** Style of the wrapping box. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style of the ScrollView that contains your children. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Won't be affected by the scroll, as children are */
  Header?: (() => JSX.Element | null) | JSX.Element | null;
  /** Won't be affected by the scroll, as children are */
  Footer?: (() => JSX.Element | null) | JSX.Element | null;
  /** If your children will be wrapped by a ScrollView.
   * @default true */
  innerScroll?: boolean;
  /** The ScrollView props when using the innerScroll prop. */
  scrollViewProps?: ScrollViewProps;
};

export const ModalView: React.FC<ModalViewProps> = ({
  onCancel, children, containerStyle,
  contentStyle, innerScroll, scrollViewProps,
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
    <Modal
      transparent
      statusBarTranslucent
      animationType='fade'
      onRequestClose={onCancel}
    >
      {/* ScrollView would throw VirtualizedLists should never be nested inside plain ScrollViews */}
      {/* We need the scroll to have keyboardShouldPersistTaps */}
      <FlatList
        overScrollMode='never'
        bounces={false}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flex: 1 }} // make the back grey spread to all screen
        nestedScrollEnabled
        data={[1]} keyExtractor={() => '1'}
        renderItem={() => (
          <Pressable onPress={onCancel} style={[s.back, { backgroundColor: theme.colors.backdrop }]}>
            {/* Pressable inside to ignore touches inside. Dismiss needed here for some reason to blur input */}
            <Pressable style={[s.container, {}, containerStyle]} onPress={() => Keyboard.dismiss()}>
              {Header && (typeof Header === 'function' ? <Header/> : Header)}
              {/* This padding because absolute stuff were being cropped */}
              {innerScroll && <PageScrollView viewStyle={[s.content, contentStyle]} nestedScrollEnabled {...scrollViewProps} children={inner()}/>}
              {!innerScroll && <View style={[s.content, theme.sizes.screen, contentStyle]} children={inner()}/>}
              {Footer && (typeof Footer === 'function' ? <Footer/> : Footer)}
            </Pressable>
          </Pressable>
        )}/>
    </Modal>
  );
};

const s = StyleSheet.create({
  /** The back grey */
  back: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  /** The box! */
  container: {
    borderRadius: 12,
    alignSelf: 'center',
    maxHeight: '80%',
    width: '80%', // TODO?
  },
  content: {
    padding: 5,
  },
});


// export function modalView(Component: (ModalView: React.FC<ModalViewProps>) => JSX.Element): void {
//   const component = <ModalView {...props} onCancel={() => {removeModal(component); props.onCancel?.();}}/>;

//   addModal(component);
// }