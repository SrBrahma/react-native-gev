// Based on https://github.com/swushi/react-native-input-outline
import type React from 'react';
import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState,
} from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { LogBox, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import type { MaskedTextInputProps } from 'react-native-mask-text';
import { mask, unMask } from 'react-native-mask-text';
import Animated, {
  Extrapolate, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../main';


// color issue
LogBox.ignoreLogs(['You are setting the style `{ color: ... }` as a prop.']);


export interface InputOutlineMethods {
  /** Requests focus for the given input or view. The exact behavior triggered will depend on the platform and type of view. */
  focus: () => void;
  /** Removes focus from an input or view. This is the opposite of focus() */
  blur: () => void;
  /** Returns current focus of input. */
  isFocused: boolean;
  /** Removes all text from the TextInput. */
  clear: () => void;
}

export interface InputOutlineProps extends MaskedTextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  leftText?: string;

  /** Placeholder for the textinput.
   * @default Placeholder */
  placeholder?: string;

  /** Vertical padding for TextInput Container. Used to calculate animations.
   * @default 12 */
  paddingVertical?: number;
  /** Vertical padding for TextInput Container.
   * @default 16 */
  paddingHorizontal?: number;

  /** Color when focused.
   * @default 'blue' */
  activeColor?: string;
  /** Color when blurred (not focused).
   * @default 'grey' */
  inactiveColor?: string;

  /** Error message is displayed. If anything is provided to error besides null or undefined, then the component is
   * within an error state, thus displaying the error message provided here and errorColor.
   * @default undefined */
  error?: string | null;
  /** Color that is displayed when in error state. Error state is anything that is not null or undefined.
   * @default 'red' */
  errorColor?: string;
  errorTextStyle?: StyleProp<TextStyle>;
  /** Trailing Icon for the TextInput.
   * @default undefined */
  trailingIcon?: React.FC;

  /** If maxLength is defined, a character count will show up if this is false.
   * @default false */
  hideCharacterCount?: boolean;
  characterCountTextStyle?: StyleProp<TextStyle>;

  /** Helper text that can be displayed to assist users with Inputs. `error` prop will override this.
   * @default undefined */
  assistiveText?: string;
  assistiveTextStyle?: StyleProp<TextStyle>;

  /** If setting this up and mask is active (you may have a good reason for it, like using conditional mask),
   * it will sum all non key chars in mask, so a maxLength 5 with a mask 999.9, will become a maxLength of
   *
   * maybe too complicated and situational. going to use a bigger maxLength and let mask remove excessive chars
   */
  // maxLength?: number
}


export const TextInputOutline = forwardRef<InputOutlineMethods, InputOutlineProps>(({
  onBlur,
  leftText,

  style, containerStyle,

  // theme colors
  inactiveColor: inactiveColorProp,
  activeColor: activeColorProp,
  errorColor: errorColorProp,

  error,
  errorTextStyle: errorTextStyleProp,

  assistiveText,
  assistiveTextStyle: assistiveTextStyleProp,

  hideCharacterCount,
  characterCountTextStyle: counterTextStyleProp,

  // styling
  paddingHorizontal = 16,
  paddingVertical = 11,

  // features
  placeholder = 'Placeholder',
  trailingIcon,

  // others
  value: valueProp = '',
  onChangeText: onChangeTextProp,
  defaultValue: defaultValueProp,

  // Mask
  mask: pattern,
  type = 'custom',
  maxLength: maxLengthProp,
  options, // No default so it won't create a new obj each render
  selectionColor: selectionColorProp,
  ...inputProps
}, ref) => {
  const theme = useTheme();

  const activeColor = activeColorProp ?? theme.colors.primary;
  const inactiveColor = inactiveColorProp ?? 'grey';
  const errorColor = errorColorProp ?? theme.colors.error;
  /** Can be overwritten in containerStyle */
  const borderRadius = theme.sizes.roundness;
  const maxLength = maxLengthProp ?? pattern?.length;
  const errorState = error !== null && error !== undefined;
  const selectionColor = errorState ? errorColor : (selectionColorProp ?? activeColor);

  const { fontSize = 18, fontFamily } = StyleSheet.flatten(style ?? {});
  const errorTextStyle = StyleSheet.flatten([
    { fontSize: 10 }, errorTextStyleProp,
  ]) as TextStyle & {fontSize: number};
  const { backgroundColor = '#fff' } = StyleSheet.flatten(containerStyle);
  const { color: counterColor, ...counterTextStyle } = StyleSheet.flatten([{
    color: inactiveColor, fontSize: 10,
  }, counterTextStyleProp]) as TextStyle & {fontSize: number};
  const { color: assistiveColor, ...assistiveStyle } = StyleSheet.flatten([{
    color: inactiveColor, fontSize: 10,
  }, assistiveTextStyleProp]) as TextStyle & {fontSize: number};



  const getDefaultMaskedValue = useCallback((useValueProp: boolean) => {
    const defaultValue = (useValueProp ? valueProp : undefined) ?? defaultValueProp ?? (type === 'currency' ? '0' : '');
    return pattern ? mask(defaultValue, pattern, type, options) : defaultValue;
  }, [defaultValueProp, options, pattern, type, valueProp]);
  const getDefaultUnmaskedValue = useCallback((useValueProp: boolean) => {
    const defaultValue = (useValueProp ? valueProp : undefined) ?? defaultValueProp ?? (type === 'currency' ? '0' : '');
    return defaultValue;
  }, [defaultValueProp, type, valueProp]);

  /** If not using mask, this equals the input value. */
  const [maskedValue, setMaskedValue] = useState(() => getDefaultMaskedValue(true));
  /** The value without the mask. */
  const [unMaskedValue, setUnmaskedValue] = useState(() => getDefaultUnmaskedValue(true));


  const onChangeText = useCallback((inputValue: string, mayBeMasked: boolean) => {
    if (!pattern) {
      setMaskedValue(inputValue);
      setUnmaskedValue(inputValue);
    } else {
      const newUnMaskedValue = mayBeMasked ? unMask(inputValue, type) : inputValue;
      const newMaskedValue = mask(newUnMaskedValue, pattern, type, options);
      setMaskedValue(newMaskedValue);
      setUnmaskedValue(newUnMaskedValue);
    }
  }, [options, pattern, type]);

  /** Callbacks on changes */
  useEffect(() => { onChangeTextProp(maskedValue, unMaskedValue); }, [maskedValue, onChangeTextProp, unMaskedValue]);

  // animation vars
  const inputRef = useRef<TextInput>(null);
  const placeholderMap = useSharedValue(valueProp ? 1 : 0);
  const placeholderSize = useSharedValue(0);
  const colorMap = useSharedValue(0);

  /** Handle `value` prop update  */
  useEffect(() => {
    if (valueProp.length)
      placeholderMap.value = withTiming(1); // focused;
    onChangeText(valueProp, false);
  }, [valueProp, onChangeText, placeholderMap]);


  // helper functinos
  const isFocused = () => Boolean(inputRef.current?.isFocused());
  const clear = () => {
    inputRef.current?.clear();
    setMaskedValue(getDefaultMaskedValue(false));
    setUnmaskedValue(getDefaultUnmaskedValue(false));
  };


  const handleFocus = useCallback(() => {
    placeholderMap.value = withTiming(1); // focused
    if (!errorState)
      colorMap.value = withTiming(1); // active
    inputRef.current?.focus();
  }, [colorMap, errorState, placeholderMap]);
  const handleBlur = useCallback(() => {
    onBlur?.(null as any);
    if (!maskedValue)
      placeholderMap.value = withTiming(0); // blur
    if (!errorState)
      colorMap.value = withTiming(0); // inactive
    inputRef.current?.blur();
  }, [colorMap, errorState, maskedValue, onBlur, placeholderMap]);

  const handlePlaceholderLayout = useCallback(({ nativeEvent }) => {
    const { width } = nativeEvent.layout;
    placeholderSize.value = width;
  }, [placeholderSize]);

  // error handling
  useEffect(() => {
    if (errorState)
      colorMap.value = 2; // error -- no animation here, snap to color immediately
    else
      colorMap.value = isFocused() ? 1 : 0; // to active or inactive color if focused
  }, [error, colorMap, errorState]);

  const animatedPlaceholderStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(placeholderMap.value,
          [0, 1],
          [0, -(paddingVertical + (fontSize * 0.7))],
        ),
      },
      { scale: interpolate(placeholderMap.value, [0, 1], [1, 0.7]) },
      {
        translateX: interpolate(
          placeholderMap.value,
          [0, 1],
          [0, -placeholderSize.value * 0.2],
        ),
      },
    ],
  }));

  const animatedPlaceholderTextStyles = useAnimatedStyle(() => ({
    color: interpolateColor(
      colorMap.value,
      [0, 1, 2],
      [inactiveColor, activeColor, errorColor],
    ),
  }));

  const animatedPlaceholderSpacerStyles = useAnimatedStyle(() => ({
    width: interpolate(
      placeholderMap.value,
      [0, 1],
      [0, (placeholderSize.value * 0.7) + 7],
      Extrapolate.CLAMP,
    ),
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: placeholderSize.value > 0
      ? interpolateColor(
        colorMap.value,
        [0, 1, 2],
        [inactiveColor, activeColor, errorColor],
      )
      : inactiveColor,
  }));

  useImperativeHandle(ref, () => ({
    focus: handleFocus,
    blur: handleBlur,
    isFocused: isFocused(),
    clear,
  }));


  const s = StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius,
      alignSelf: 'stretch',
      flexDirection: 'row',
      backgroundColor,
    },
    inputContainer: {
      flex: 1,
      paddingVertical,
      paddingHorizontal,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    input: {
      textAlignVertical: ((inputProps.numberOfLines ?? 1) > 1) ? 'top' : 'center',
      textAlign: leftText ? 'right' : 'left',
      flex: 1,
      fontSize,
      fontFamily,
      top: 0.5, // move it a little down
    },
    placeholder: {
      position: 'absolute',
      top: paddingVertical,
      left: paddingHorizontal,
    },
    placeholderText: {
      fontSize,
      fontFamily,
    },
    placeholderSpacer: {
      position: 'absolute',
      top: -1,
      left: paddingHorizontal - 3,
      backgroundColor,
      height: 2,
    },
    errorText: {
      position: 'absolute',
      color: errorColor,
      bottom: -errorTextStyle.fontSize - 7,
      left: paddingHorizontal,
    },
    trailingIcon: {
      position: 'absolute',
      right: paddingHorizontal,
      alignSelf: 'center',
    },
    counterText: {
      position: 'absolute',
      color: errorState ? errorColor : counterColor,
      bottom: -counterTextStyle.fontSize - 7,
      right: paddingHorizontal,
    },
    assistiveText: {
      position: 'absolute',
      color: assistiveColor,
      bottom: -assistiveStyle.fontSize - 7,
      left: paddingHorizontal,
    },
    leftText: {
      textAlignVertical: 'center',
      fontSize: 14,
      marginLeft: -4,
      paddingRight: 4,
      height: '100%',
      color: '#555',
      fontWeight: 'bold',
    },
  });

  const placeholderStyle = useMemo(() => (
    [s.placeholder, animatedPlaceholderStyles]
  ), [s.placeholder, animatedPlaceholderStyles]);

  return (
    <Animated.View style={[s.container, animatedContainerStyle, containerStyle]}>
      <TouchableWithoutFeedback onPress={handleFocus} style={s.inputContainer}>
        {/* Only show leftText if there is a input. Else placeholder would be on top of it. */}
        {!!leftText && !!maskedValue && <Text style={s.leftText}>{leftText}</Text>}
        <TextInput
          {...inputProps}
          ref={inputRef}
          style={[s.input, style]}
          pointerEvents={isFocused() ? 'auto' : 'none'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={(v) => onChangeText(v, true)}
          maxLength={maxLength}
          selectionColor={selectionColor}
          placeholder='' // Overwrite
          value={maskedValue}
        />
      </TouchableWithoutFeedback>
      {trailingIcon && <View style={s.trailingIcon}>{trailingIcon({})}</View>}
      <Animated.View style={[s.placeholderSpacer, animatedPlaceholderSpacerStyles]}/>
      <Animated.View style={placeholderStyle} onLayout={handlePlaceholderLayout} pointerEvents='none'>
        <Animated.Text style={[s.placeholderText, animatedPlaceholderTextStyles]} children={placeholder}/>
      </Animated.View>
      {/* Using maxLengthProp as maxLength may be set by mask length. */}
      {maxLengthProp && !hideCharacterCount && <Text style={[s.counterText, counterTextStyleProp]}>{`${unMaskedValue.length} / ${maxLength}`}</Text>}
      {errorState
        ? <Text style={[s.errorText, errorTextStyle]}>{error}</Text>
        : (assistiveText && (<Text style={[s.assistiveText, assistiveStyle]}>{assistiveText}</Text>))
      }
    </Animated.View>
  );
});