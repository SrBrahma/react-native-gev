import { Pressable, Text, View } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import type { StackHeaderProps } from '@react-navigation/stack';
// import { C } from '../../../main/constsUi';
// import { F } from '../../../main/fonts';



// export function HeaderTitleSkeleton(): JSX.Element {
//   return <View style={{
//     backgroundColor: C.mainLighter3,
//     height: 30,
//     width: 200,
//     borderRadius: 4,
//   }}/>;
// }


export const HeaderHeight = 86;


type HeaderBackButton = {
  onPress: () => void;
  floating?: boolean;
  absolute?: boolean;
  /** If it should face down */
  down?: boolean;
};


export function HeaderBackButton({ onPress, floating, down }: HeaderBackButton): JSX.Element {
  const iconSize = 26;
  const whitePadding = floating ? 8 : 0;
  const hitSlop = 40;
  const borderMargin = 12;
  const Wrapper = ({ children }: any) => (floating
    ? <Shadow distance={2}
      viewStyle={{ backgroundColor: '#fff', borderRadius: 999, padding: whitePadding }}
      containerViewStyle={{ position: 'absolute', marginLeft: borderMargin, marginTop: borderMargin }}
      safeRender children={children}/>
    : children);
  return (
    <Wrapper>
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop} style={{ overflow: 'hidden' }}
        android_ripple={{ color: floating ? C.rippleOnBg : C.rippleOnMain, borderless: true }}
      >
        <MaterialCommunityIcons name={down ? 'chevron-down' : 'chevron-left'} size={iconSize} style={{ right: 0.5 }}/>
      </Pressable>
    </Wrapper>
  );
}

export function Header({ headerBackProps, ...props }: StackHeaderProps & {headerBackProps?: Partial<HeaderBackButton>}): any {
  const [, stateType] = useNavigationState((state) => [state.routes.length, state.type]);

  const hasRtn = stateType === 'stack' && props.navigation.canGoBack() && !props.options.headerLeft;
  const title = props.options.headerTitle || props.options.title || undefined;

  if (!props.options.headerShown)
    return;


  return (
    <View style={[
      {
        flexDirection: 'row',
        width: '100%',
        height: HeaderHeight,
        paddingHorizontal: 24,
        paddingTop: 2,
        alignItems: 'center',
      }, props.options.headerStyle,
    ]}
    >
      {hasRtn && <HeaderBackButton onPress={() => props.navigation.goBack()} {...headerBackProps}/>}
      {props.options.headerLeft?.({} as any)}
      {!!title && <Text style={{
        includeFontPadding: false,
        flexGrow: 1,
        textAlign: props.options.headerTitleAlign,
        fontFamily: F.Roboto_500Medium,
        fontSize: 22,
        paddingLeft: props.options.headerTitleAlign === 'center'
          ? undefined
          : 22,
      }}>{typeof title === 'string' ? title : title(null as any)}</Text>}
      {props.options.headerRight?.(null as any)}
    </View>
  );
}


export function HeaderRightText({ text, onPress }: {text: string; onPress?: () => void | Promise<void>}): JSX.Element {
  return (<Pressable
    android_ripple={{ color: C.rippleOnMain }}
    onPress={onPress}
  >
    {/* For some reason, without this vertical offset it wouldnt seem to be aligned. */}
    <Text style={{ margin: 14, fontWeight: 'bold', includeFontPadding: false, top: 1.5 }}>{text}</Text>
  </Pressable>);
}