import { useCallback, useRef } from 'react';
import type { GestureResponderEvent, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { ShadowProps } from 'react-native-shadow-2';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import { useTheme } from '../../main/theme';
import { mLoading } from '../Modals/mLoading';
import { Text } from '../Others/Text';


// To support color names: https://github.com/omgovich/colord#plugins
extend([namesPlugin]);


const buttonBorderRadius = 4;
const buttonMargin = 12;
const iconSize = 22;

const iconPadding = 15;

// const totalIconSize = iconSize + iconPadding * 2;


type Icons = keyof typeof MaterialCommunityIcons.glyphMap;


export type ButtonProps<FunRtn extends void | any | Promise<any> = unknown> = {
  text: string;
  /** Alias to `text`. */
  // t: string;
  /** */
  // Removes the function from the pressable style type. It messes the Shadow-roundness-obtaining
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** The style of the wrapping shadow. Shortcut for shadowProps.containerViewStyle.
   * Use this for margins. */
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
  onPress: (() => FunRtn);
  /** Triggered when pressing it while it is disabled. Useful for example to point out the user where the error is in a form. */
  onDisabledPress?: () => void;
  /** @default false */
  hasShadow?: boolean;
  /** Inverts the inner color. */
  invert?: boolean;
  // outlineOnInvert
  /** Converts the text to uppercase.
   * @default false */
  uppercase?: boolean;
  /** react-native-shadow-2's props for the wrapping Shadow component. */
  shadowProps?: ShadowProps;
} & PressableProps;


export function Button<T extends(void | any | Promise<any>)>({
  marginTop: marginTopArg = false,
  leftIcon: leftIconProp,
  onPress: onPressProp,
  awaitOnPress = true,
  hasShadow = false,
  disabled, onDisabledPress,
  stretchRow,
  stretch = stretchRow,
  iconContainerStyle,
  text: textProp,
  textStyle,
  invert,
  uppercase,
  style: styleProp,
  shadowProps,
  ...props
}: ButtonProps<T>): JSX.Element {

  const text = uppercase ? textProp.toLocaleUpperCase() : textProp;
  const style = StyleSheet.flatten<ViewStyle>(styleProp || {});
  const { colors, fonts } = useTheme();

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

  const backgroundColor = StyleSheet.flatten([
    { backgroundColor: colorDefaultIsPrimary },
    style,
    disabled && { backgroundColor: colors.disabled },
  ]).backgroundColor ?? '#449';

  /** I like a light ripple even on light buttons, but there is a point where it can't be anymore noticeable, so we must use a dark ripple!
   * https://github.com/omgovich/colord/issues/89 */
  const rippleColor = colord(backgroundColor as any).brightness() > 0.8 ? '#0000001a' : '#ffffff2f';

  const onPress = useCallback(async (e: GestureResponderEvent) => {
    if (disabled) return onDisabledPress?.();
    // Don't trigger if already awaiting a previous press. pointerEvents on loading modal wouldn't work as it isn't the parent of this.
    if (isAwaitingPress.current) return;
    Keyboard.dismiss();
    if (awaitOnPress) {
      isAwaitingPress.current = true;
      await mLoading(onPressProp).finally(() => { isAwaitingPress.current = false; });
    }
    else void onPressProp(e);
  }, [awaitOnPress, disabled, onDisabledPress, onPressProp]);

  /** We do this to remove the ripple overflow. The parent style must contain the radii.
   * https://github.com/facebook/react-native/issues/6480 */
  const { borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius } = style;

  return (
    <Shadow
      offset={[0, 0.5]}
      distance={2} // cleaner without it.
      startColor='#0001'
      {...!hasShadow && { distance: 0, paintInside: false }}
      {...shadowProps}
      containerViewStyle={[s.shadowContainer, { marginTop }, stretchRow && s.shadowContainerStretchRow, props.containerStyle, shadowProps?.containerViewStyle]}
      viewStyle={[
        s.shadowView,
        { borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius },
        shadowProps?.viewStyle,
      ]}
    >
      <Pressable
        android_ripple={{ color: rippleColor }}
        onPress={onPress}
        {...props} // We don't use the disabled prop in Pressable so it keeps the ripple. It isn't contained in props.
        style={[
          s.pressable,
          stretch && s.pressableStretch,
          style,
          { backgroundColor },
        ]}
      >
        {leftIcon}
        <Text
          selectable={false}
          adjustsFontSizeToFit
          textBreakStrategy='simple' // https://stackoverflow.com/a/54750759
          numberOfLines={1}
          style={[s.text, fonts.bold, leftIcon && s.textWhenIcon, { color: colorDefaultIsSecondary }, textStyle]}
          t={text}
        />
      </Pressable>
    </Shadow>
  );
}

/** Useful when having a leftIcon with background color, so you want to paddingLeft the text. */
export const buttonPaddingHorizontal = 22;

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
    minHeight: iconSize + (iconPadding * 2),
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
    paddingHorizontal: buttonPaddingHorizontal,
    flexShrink: 1, // Also needed to make adjustsFontSizeToFit work
    fontSize: 18.5,
    textAlign: 'center',
    textAlignVertical: 'bottom',
    includeFontPadding: false,
    paddingTop: Platform.OS === 'web' ? 4 : 2, // It was for some reason a little to the top
  },
  /** Do also use text */
  textWhenIcon: {
    fontSize: 17,
    paddingLeft: 0,
  },
});
