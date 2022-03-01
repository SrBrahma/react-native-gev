import { useCallback, useMemo, useRef } from 'react';
import type { GestureResponderEvent, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { ShadowProps } from 'react-native-shadow-2';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import type { MayBeFunction } from '../../internalUtils/defaultProps';
import { propsMerger, useGetDefaultProps } from '../../internalUtils/defaultProps';
import type { OmitKey } from '../../internalUtils/types';
import { useTheme } from '../../main/theme';
import { mLoading } from '../Modals/mLoading';
import type { TextProps } from '../Others/Text';
import { Text } from '../Others/Text';


// To support color names: https://github.com/omgovich/colord#plugins
extend([namesPlugin]);


const buttonBorderRadius = 4;
const buttonMargin = 12;
const iconSize = 22;

const iconPadding = 15;

// const totalIconSize = iconSize + iconPadding * 2;


type Icons = keyof typeof MaterialCommunityIcons.glyphMap;

// Based on https://reactnativeelements.com/docs/button#type, uikitten for filled
export type ButtonType = 'filled' | 'clear' | 'outline'; // TODO

export interface ButtonProps<FunRtn extends void | any | Promise<any> = unknown> extends PressableProps {
  text?: string;
  /** Alias to `text`. */
  t?: string;
  /** Converts the text to uppercase.
   * @default false */
  uppercase?: boolean;
  textProps?: TextProps;
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
  /** If the button should use the least amount of space to fit its content instead of using all the available space
   * .
   * If `row` is false, this changes the `alignSelf` of `containerStyle` from `'stretch'` to this property value.
   *
   * If `row` is true, this removes the `flexGrow` of `containerStyle`.
   *
   * If true, defaults to `'center'` if `row` is false.
  */
  shrink?: boolean | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  /** Use this when the button is inside a row view. */
  row?: boolean;
  /** If awaitOnPress, will set a fullscreen loading. */
  onPress: ((e: GestureResponderEvent) => FunRtn);
  /** Triggered when pressing it while it is disabled. Useful for example to point out the user where the error is in a form. */
  onDisabledPress?: () => void;
  /** @default false */
  hasShadow?: boolean;
  /** Inverts the inner color. */
  invert?: boolean;
  /** react-native-shadow-2's props for the wrapping Shadow component. */
  shadowProps?: ShadowProps;
}

/** If a function, it's run as a React Hook. */
export type ButtonPropsTheme = MayBeFunction<Partial<OmitKey<ButtonProps, 'testID' | 'nativeID' | 'text' | 'children'>>>;


export function Button<T extends(void | any | Promise<any>)>(props: ButtonProps<T>): JSX.Element {
  const { colors, fonts, defaultProps: themeProps } = useTheme();

  const defaultProps = useGetDefaultProps(themeProps.Button);

  // ts strange error on stretch = strechRow if not doing this here separatedly
  const mergedProps = useMemo(() => propsMerger<ButtonProps>({
    props: [defaultProps, props],
    stylesKeys: ['style', 'textStyle', 'iconContainerStyle', 'containerStyle'],
  }), [defaultProps, props]);

  const {
    marginTop: marginTopArg = false,
    leftIcon: leftIconProp,
    onPress: onPressProp,
    awaitOnPress = true,
    hasShadow = false,
    disabled, onDisabledPress,
    shrink: shrinkProp,
    row,
    iconContainerStyle,
    text: textProp, t,
    textStyle, textProps,
    invert,
    uppercase,
    style: styleProp,
    shadowProps,
    ...p
  } = mergedProps;

  let text = textProp ?? t ?? ' ';
  if (uppercase)
    text = text.toLocaleUpperCase();

  const style = StyleSheet.flatten<ViewStyle>(styleProp || {});

  const colorDefaultIsPrimary = invert ? colors._button.text : colors._button.action;
  const colorDefaultIsSecondary = invert ? colors._button.action : colors._button.text;

  const marginTop = marginTopArg
    ? (typeof marginTopArg === 'number' ? marginTopArg : buttonMargin)
    : 0;

  /** Disables pressing while awaiting. */
  const isAwaitingPress = useRef(false);

  const textColor = StyleSheet.flatten([
    { color: colorDefaultIsSecondary },
    textStyle,
    textProps?.style,
  ]).color;

  const leftIcon = leftIconProp && (
    <View style={[s.iconContainer, iconContainerStyle]}>{
      typeof leftIconProp === 'string'
        ? <MaterialCommunityIcons name={leftIconProp} style={[s.icon, { color: textColor }]}/>
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
  const rippleColor = colord(backgroundColor as any).brightness() > 0.8 ? '#00000014' : '#ffffff2f';

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

  /** We do this to remove the ripple overflow. The parent style must contain the radii (and also overflow: 'hidden').
   * https://github.com/facebook/react-native/issues/6480 */
  const { borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius } = style;

  const shrink = shrinkProp === true ? 'center' : shrinkProp;

  return (
    <Shadow
      offset={[0, 0.5]}
      distance={2} // cleaner without it.
      startColor='#0001'
      {...!hasShadow && { distance: 0, paintInside: false }}
      {...shadowProps}
      containerViewStyle={[
        row
          ? (shrink ? s.shadowContainerRowShrink : s.shadowContainerRow)
          : (shrink ? { alignSelf: shrink } : s.shadowContainerColumn),
        { marginTop },
        p.containerStyle, shadowProps?.containerViewStyle,
      ]}
      viewStyle={[
        s.shadowView,
        { borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius },
        shadowProps?.viewStyle,
      ]}
    >
      <Pressable
        android_ripple={{ color: rippleColor }}
        onPress={onPress}
        {...p} // We don't use the disabled prop in Pressable so it keeps the ripple. It isn't contained in props.
        style={[
          s.pressable,
          shrink && s.pressableShrink,
          leftIcon && s.pressableWhenLeftIcon,
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
          t={text}
          {...textProps}
          style={[s.text, fonts.bold, leftIcon && s.textWhenIcon, { color: textColor }, textStyle, textProps?.style]}
        />
      </Pressable>
    </Shadow>
  );
}

/** Useful when having a leftIcon with background color, so you want to paddingLeft the text. */
export const buttonPaddingHorizontal = 28;

const s = StyleSheet.create({
  shadowContainerColumn: {
    alignSelf: 'stretch',
  },
  shadowContainerRow: {
    flexGrow: 1,
  },
  shadowContainerRowShrink: {
  },
  shadowView: {
    overflow: 'hidden', // Remove ripple overflow.
    flexDirection: 'column',
    alignSelf: 'stretch',
  },
  pressable: {
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
    overflow: 'hidden', // To remove ripple going outside border radius
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: buttonBorderRadius,
    flexDirection: 'row',
    minHeight: iconSize + (iconPadding * 2),
    flexGrow: 1,
    paddingHorizontal: buttonPaddingHorizontal,
  },
  pressableWhenLeftIcon: {

  },
  pressableShrink: {
    flexGrow: 0,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderTopLeftRadius: buttonBorderRadius,
    borderBottomLeftRadius: buttonBorderRadius,
    paddingRight: 11,
  },
  icon: {
    fontSize: 28,
  },
  text: {
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
  },
});
