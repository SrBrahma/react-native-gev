import { useCallback, useMemo, useRef } from 'react';
import type { GestureResponderEvent, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import type { ShadowProps } from 'react-native-shadow-2';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import type { ThemeProps } from '../../internalUtils/defaultProps';
import { propsMerger, useGetThemeDefaultProps } from '../../internalUtils/defaultProps';
import { useTheme } from '../../main/theme';
import { mLoading } from '../PortalsAndModals/mLoading';
import { Pressable } from '../Simple/Pressable';
import type { TextProps } from '../Simple/Text';
import { Text } from '../Simple/Text';


// To support color names: https://github.com/omgovich/colord#plugins
extend([namesPlugin]);


const buttonBorderRadius = 4;
const buttonMargin = 12;
const iconSize = 22;

const iconPadding = 15;

// const totalIconSize = iconSize + iconPadding * 2;


type Icons = keyof typeof MaterialCommunityIcons.glyphMap;

// Based on https://reactnativeelements.com/docs/button#type, uikitten for filled
export type ButtonType = 'solid' | 'outline' | 'outlineClear' | 'clear';

export interface ButtonProps<FunRtn extends void | any | Promise<any> = unknown> extends PressableProps {
  /** TODO improve this comment
   * * `'solid'` - Paint inside with theme.primary by default.
   * * `'outline'` - Same as `'solid'` but has an outline with the text's color and with width defined by `outlineWidth`.
   * * `'outlineClear'` - Same as `'outline'` but the `backgroundColor` is transparent.
   * * `'clear'` - Just the text. No `backgroundColor` or outline.
   * @default 'solid' */
  type?: ButtonType;
  /** Switches the background color and the text color. */
  invert?: boolean;
  /** The borderWidth when `type === 'outline'`.
   * @default 1 */
  outlineWidth?: number;
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

  /** react-native-shadow-2's props for the wrapping Shadow component. */
  shadowProps?: ShadowProps;
}

/** If a function, it's run as a React Hook. */
export type ButtonPropsTheme = ThemeProps<ButtonProps, 'testID' | 'nativeID' | 'text' | 'children'>;


export function Button<T extends(void | any | Promise<any>)>(props: ButtonProps<T>): JSX.Element {
  const { colors, fonts, defaultProps: themeProps } = useTheme();

  const defaultProps = useGetThemeDefaultProps({
    themeProps: themeProps.Button,
    componentProps: props,
  });

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
    type = 'solid',
    outlineWidth = 1,
    containerStyle,
    ...p
  } = mergedProps;

  let text = textProp ?? t ?? ' ';
  if (uppercase)
    text = text.toLocaleUpperCase();

  const style = StyleSheet.flatten<ViewStyle>(styleProp || {});

  const backgroundColorTemp = invert ? colors._button.text : colors._button.action;
  const textColorTemp = invert ? colors._button.actionTextInverted : colors._button.text;

  const hasOutline = type === 'outline' || type === 'outlineClear';
  const shrink = shrinkProp === true ? 'center' : shrinkProp;

  const marginTop = marginTopArg
    ? (typeof marginTopArg === 'number' ? marginTopArg : buttonMargin)
    : 0;

  /** Disables pressing while awaiting. */
  const isAwaitingPress = useRef(false);

  const textColor = StyleSheet.flatten([
    { color: textColorTemp },
    textStyle,
    textProps?.style,
  ]).color;
  const backgroundColor = StyleSheet.flatten([
    { backgroundColor: backgroundColorTemp },
    style,
    disabled && { backgroundColor: colors.disabled },
  ]).backgroundColor ?? '#449';

  const leftIcon = useMemo(() => leftIconProp && (
    <View style={[s.iconContainer, iconContainerStyle]}>{
      typeof leftIconProp === 'string'
        ? <MaterialCommunityIcons name={leftIconProp} style={[s.icon, { color: textColor }]}/>
        : leftIconProp
    }</View>
  ), [iconContainerStyle, leftIconProp, textColor]);



  const sPressable = StyleSheet.flatten<ViewStyle>([
    s.pressable,
    shrink && s.pressableShrink,
    leftIcon && s.pressableWhenLeftIcon,
    style,
    { backgroundColor },
  ]);

  // TODO will break on string paddings
  if (hasOutline) {
    sPressable.paddingLeft = (sPressable.paddingLeft ?? sPressable.paddingHorizontal ?? sPressable.padding ?? 0) as number - outlineWidth;
    sPressable.paddingRight = (sPressable.paddingRight ?? sPressable.paddingHorizontal ?? sPressable.padding ?? 0) as number - outlineWidth;
    sPressable.paddingTop = (sPressable.paddingTop ?? sPressable.paddingVertical ?? sPressable.padding ?? 0) as number - outlineWidth;
    sPressable.paddingBottom = (sPressable.paddingBottom ?? sPressable.paddingVertical ?? sPressable.padding ?? 0) as number - outlineWidth;
    sPressable.borderWidth = outlineWidth;
    // Allows overwritting.
    sPressable.borderColor = sPressable.borderColor ?? textColor;
    sPressable.backgroundColor = type === 'outlineClear' ? 'transparent' : backgroundColor;
  }


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


  const containerStyleMemo = useMemo(() => StyleSheet.flatten([
    row
      ? (shrink ? s.shadowContainerRowShrink : s.shadowContainerRow)
      : (shrink ? { alignSelf: shrink } : s.shadowContainerColumn),
    { marginTop },
    containerStyle, shadowProps?.containerViewStyle,
  ]), [containerStyle, marginTop, row, shadowProps?.containerViewStyle, shrink]);

  const contentStyleMemo = useMemo(() => StyleSheet.flatten([
    s.shadowView,
    { borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius },
    shadowProps?.viewStyle,
  ]), [borderBottomLeftRadius, borderBottomRightRadius, borderRadius, borderTopLeftRadius, borderTopRightRadius, shadowProps?.viewStyle]);

  const inner = useMemo(() =>
    <Pressable
      feedback={disabled ? 'none' : 'ripple'}
      onPress={onPress}
      {...p} // We don't use the disabled prop in Pressable so it keeps the ripple. It isn't contained in props.
      s={sPressable}
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
  , [onPress, p, sPressable, text, textStyle, textProps, textColor, disabled, fonts.bold, leftIcon]);

  const result = useMemo(() => {
    if (hasShadow) {
      return (
        <Shadow
          offset={[0, 0.5]}
          distance={2} // cleaner without it.
          startColor='#0001'
          {...shadowProps}
          containerViewStyle={containerStyleMemo}
          viewStyle={contentStyleMemo}
        >
          {inner}
        </Shadow>
      );
    }
    else return (
      <View style={containerStyleMemo}>
        <View style={contentStyleMemo}>
          {inner}
        </View>
      </View>
    );
  }, [inner, containerStyleMemo, contentStyleMemo, hasShadow, shadowProps]);

  return result;
}

/** Useful when having a leftIcon with background color, so you want to paddingLeft the text. */
export const buttonPaddingHorizontal = 28;

const s = StyleSheet.create({
  shadowContainerColumn: {
    alignSelf: 'stretch',
  },
  shadowContainerRow: {
    flexGrow: 1,
    flexShrink: 1, // For adjustsFontSizeToFit.
  },
  shadowContainerRowShrink: {
    flexShrink: 1, // For adjustsFontSizeToFit.
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
    minHeight: iconSize + (iconPadding * 2), // change this? not good to change it?
    flexGrow: 1,
    paddingHorizontal: buttonPaddingHorizontal,
  },
  pressableWhenLeftIcon: {
    paddingLeft: 19,
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
    textAlignVertical: 'center',
    top: StyleSheet.hairlineWidth * 1,
  },
  /** Do also use text */
  textWhenIcon: {
    fontSize: 17,
  },
});
