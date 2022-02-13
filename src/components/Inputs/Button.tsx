import { useRef } from 'react';
import { Keyboard, Platform, Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { modalLoading } from '../Modals/modalLoading';
import { Text } from '../Others/Text';



const buttonBorderRadius = 4;
const buttonMargin = 12;
const iconSize = 22;

const iconPadding = 15;

// const totalIconSize = iconSize + iconPadding * 2;


type Icons = keyof typeof MaterialCommunityIcons.glyphMap;


export type ButtonProps<T extends void | any | Promise<any>> = {
  /** You may pass an array if you want to space between two texts. */
  text: string;
  /** Use this! */
  containerStyle?: ViewStyle;
  leftIcon?: Icons | JSX.Element;
  iconContainerStyle?: ViewStyle;
  // contentStyle?: ViewStyle;
  /** If should add marginTop.
   *
   * `true` will use a default value, but you may provide a number.
   *
   * @default false */
  marginTop?: number | boolean;
  /** If should render a fullscreen Loading. Will also alert on error.
   * @default true */
  awaitOnPress?: boolean;
  /** If should use all horizontal space.
   *
   * @default false */
  stretch?: boolean;
  /** Use it when to stretch inside a row view. */
  stretchRow?: boolean;
  /** If awaitOnPress, will set a fullscreen loading. */
  onPress: (() => T);
  /** Triggered when pressing it while it is disabled. Useful for example to point out the user where the error is in a form. */
  onDisabledPress?: () => void;
  /** @default false */
  hasShadow?: boolean;
  /** Inverts the inner color. */
  invert?: boolean;
  // outlineOnInvert
} & PressableProps;


export function Button<T extends(void | any | Promise<any>)>({
  marginTop: marginTopArg = false,
  leftIcon: leftIconProp,
  onPress,
  awaitOnPress = true,
  hasShadow = false,
  disabled, onDisabledPress,
  stretchRow,
  stretch = stretchRow,
  iconContainerStyle,
  text,
  invert,
  ...props
}: ButtonProps<T>): JSX.Element {

  const { colors } = useTheme();

  const colorDefaultIsPrimary = invert ? colors._button.text : colors._button.action;
  const colorDefaultIsSecondary = invert ? colors._button.action : colors._button.text;

  const marginTop = marginTopArg
    ? (typeof marginTopArg === 'number' ? marginTopArg : buttonMargin)
    : 0;

  /** Disables pressing while awaiting. */
  const isAwaitingPress = useRef(false);

  const leftIcon = leftIconProp && (
    <View style={[s.iconContainer, iconContainerStyle]}>{
      typeof leftIconProp === 'string'
        ? <MaterialCommunityIcons name={leftIconProp} style={[s.icon, { color: colorDefaultIsSecondary }]}/>
        : leftIconProp
    }</View>
  );

  return (
    <Shadow
      offset={[0, 0.5]}
      distance={2} // cleaner without it.
      startColor='#0001'
      radius={buttonBorderRadius}
      containerViewStyle={[s.shadowContainer, { marginTop }, stretchRow && s.shadowContainerStretchRow, props.containerStyle]}
      viewStyle={s.shadowView}
      {...!hasShadow && { distance: 0, paintInside: false }}
    >
      {/* We don't use the disabled prop in Pressable so it keeps the ripple. */}
      <Pressable
        android_ripple={{ color: '#ffffff2f' }}
        onPress={async (e) => {
          if (disabled)
            return onDisabledPress?.();

          // Don't trigger if already awaiting a previous press. pointerEvents on loading modal wouldn't work as it isn't the parent of this.
          if (isAwaitingPress.current)
            return;

          Keyboard.dismiss();

          if (!awaitOnPress)
            void onPress(e);

          else {
            isAwaitingPress.current = true;
            await modalLoading(onPress)
              .finally(() => { isAwaitingPress.current = false; });
          }
        }}
        {...props}
        style={[
          s.pressable,
          { backgroundColor: colorDefaultIsPrimary },
          disabled && { backgroundColor: colors.disabled },
          stretch && s.pressableStretch,
          typeof props.style === 'object' && props.style,
        ]}
      >
        {leftIcon}
        {/* // https://stackoverflow.com/a/54750759 */}
        <Text
          selectable={false}
          adjustsFontSizeToFit
          textBreakStrategy='simple'
          numberOfLines={1}
          style={[s.text, leftIcon && s.textWhenIcon, { color: colorDefaultIsSecondary }]}
        >
          {text}
        </Text>
      </Pressable>
    </Shadow>
  );
}


const s = StyleSheet.create({
  shadowContainer: {
    flexShrink: 1, // To make adjustsFontSizeToFit work
  },
  shadowContainerStretchRow: {
    flexGrow: 1, // No row grow without this
  },
  shadowView: {
    flexDirection: 'column',
    alignSelf: 'stretch',
  },
  pressableStretch: {
    alignSelf: 'stretch',
    flexGrow: 1,
  },
  pressable: {
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
    overflow: 'hidden', // To remove ripple going outside border radius
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: buttonBorderRadius,
    flexDirection: 'row',
    minHeight: iconSize + iconPadding * 2,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    alignSelf: 'stretch',
    borderTopLeftRadius: buttonBorderRadius,
    borderBottomLeftRadius: buttonBorderRadius,
  },
  icon: {
    fontSize: 28,
    left: 4,
  },
  text: {
    paddingTop: 2,
    paddingHorizontal: 22,
    flexShrink: 1, // Also needed to make adjustsFontSizeToFit work
    textShadowColor: '#0002',
    textShadowRadius: 2,
    fontSize: 18.5,
    letterSpacing: 0.3,
    textAlign: 'center',
    textAlignVertical: 'bottom',
    includeFontPadding: false,
    fontWeight: 'bold',
    ...(Platform.OS === 'web' && { paddingTop: 4 }), // It was for some reason a little to the top
  },
  /** Do also use text */
  textWhenIcon: {
    fontSize: 17,
    paddingLeft: 0,
  },
});
