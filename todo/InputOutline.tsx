// My changed version of https://github.com/swushi/react-native-input-outline

import React, {
  forwardRef, useCallback, useEffect, useImperativeHandle,
  useMemo, useRef, useState,
} from 'react';
import {
  LogBox, StyleSheet, Text, TextInput,
  TextStyle, TouchableWithoutFeedback, View,
} from 'react-native';
import { mask, MaskedTextInputProps, unMask } from 'react-native-mask-text';
import Animated, {
  Extrapolate, interpolate, interpolateColor,
  useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';


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
  inputStyle?: TextStyle;
  leftText?: string;

  /** Placeholder for the textinput.
   * @default Placeholder */
  placeholder?: string;
  /** Font size for TextInput.
   * @default 14 */
  fontSize?: number;
  /** Color of TextInput font.
   * @default 'black' */
  fontColor?: string;
  /** Font family for all fonts.
   * @default undefined */
  fontFamily?: string;
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
  /** Background color of the InputOutline.
   * @default 'white' */
  backgroundColor?: string;
  /** Error message is displayed. If anything is provided to error besides null or undefined, then the component is
   * within an error state, thus displaying the error message provided here and errorColor.
   * @default undefined */
  error?: string;
  /** Color that is displayed when in error state. Error state is anything that is not null or undefined.
   * @default 'red' */
  errorColor?: string;
  /** Trailing Icon for the TextInput.
   * @default undefined */
  trailingIcon?: React.FC;
  /** Border radius applied to container.
   * @default 5 */
  roundness?: number;
  /** If maxLength is defined, a character count will show up if this is false.
   * @default false */
  hideCharacterCount?: boolean;
  characterCountFontSize?: number;
  characterCountFontFamily?: string;
  characterCountColor?: string;
  /** Helper text that can be displayed to assist users with Inputs. `error` prop will override this.
   * @default undefined */
  assistiveText?: string;
  /** Font size of assistive text.
   * @default 10 */
  assistiveTextFontSize?: number;
  /** Color of assistive text.
   * @default inactiveColor */
  assistiveTextColor?: string;
  /** Font family of assistive text.
   * @default undefined */
  assistiveFontFamily?: string;
  /** Font size of error text.
   * @default 10 */
  errorFontSize?: number;
  /** Font family of error text.
   * @default undefined */
  errorFontFamily?: string;

  /** If setting this up and mask is active (you may have a good reason for it, like using conditional mask),
   * it will sum all non key chars in mask, so a maxLength 5 with a mask 999.9, will become a maxLength of
   *
   * maybe too complicated and situational. going to use a bigger maxLength and let mask remove excessive chars
   */
  // maxLength?: number
}


export const InputOutline = forwardRef<InputOutlineMethods, InputOutlineProps>((props, ref) => {
  // establish provided props
  const {
    onBlur,
    leftText,
    inputStyle,

    // theme colors
    inactiveColor = 'grey',
    activeColor = 'blue',
    errorColor = '#dd0020',
    backgroundColor = 'white',

    // fonts
    fontSize = 14,
    fontColor = 'black',
    fontFamily,

    error,
    errorFontSize = 10,
    errorFontFamily,

    assistiveText,
    assistiveTextFontSize = 10,
    assistiveTextColor = inactiveColor,
    assistiveFontFamily,

    hideCharacterCount,
    characterCountFontFamily,
    characterCountColor = inactiveColor,
    characterCountFontSize = 10,

    // styling
    paddingHorizontal = 16,
    paddingVertical = 11,
    roundness = 5,
    style,

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
    maxLength = pattern?.length,
    options, // No default so it won't create a new obj each render
    ...inputProps
  } = props;


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
  useEffect(() => {
    onChangeTextProp(maskedValue, unMaskedValue);
  }, [maskedValue, onChangeTextProp, unMaskedValue]);




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
  const focus = () => inputRef.current?.focus();
  const blur = () => inputRef.current?.blur();
  const isFocused = () => Boolean(inputRef.current?.isFocused());
  const clear = () => {
    Boolean(inputRef.current?.clear());
    setMaskedValue(getDefaultMaskedValue(false));
    setUnmaskedValue(getDefaultUnmaskedValue(false));
  };

  const errorState = useCallback(() => (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    error !== null && error !== undefined
  ), [error]);

  const handleFocus = () => {
    placeholderMap.value = withTiming(1); // focused
    if (!errorState())
      colorMap.value = withTiming(1); // active
    focus();
  };
  const handleBlur = () => {
    onBlur?.(null as any);
    if (!maskedValue)
      placeholderMap.value = withTiming(0); // blur
    if (!errorState())
      colorMap.value = withTiming(0); // inactive
    blur();
  };

  const handlePlaceholderLayout = useCallback(({ nativeEvent }) => {
    const { width } = nativeEvent.layout;
    placeholderSize.value = width;
  }, [placeholderSize]);

  const renderTrailingIcon = useCallback(() => {
    if (trailingIcon)
      return trailingIcon({});
    return null;
  }, [trailingIcon]);

  // error handling
  useEffect(() => {
    if (errorState())
      colorMap.value = 2; // error -- no animation here, snap to color immediately
    else
      colorMap.value = isFocused() ? 1 : 0; // to active or inactive color if focused
  }, [error, colorMap, errorState]);

  const animatedPlaceholderStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(placeholderMap.value,
          [0, 1],
          [0, -(paddingVertical + fontSize * 0.7)],
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
      [0, placeholderSize.value * 0.7 + 7],
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
    clear: clear,
  }));

  const styles = StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: roundness,
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
      color: fontColor,
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
      fontSize: errorFontSize,
      fontFamily: errorFontFamily,
      bottom: -errorFontSize - 7,
      left: paddingHorizontal,
    },
    trailingIcon: {
      position: 'absolute',
      right: paddingHorizontal,
      alignSelf: 'center',
    },
    counterText: {
      position: 'absolute',
      color: errorState() ? errorColor : characterCountColor,
      fontSize: characterCountFontSize,
      bottom: -characterCountFontSize - 7,
      right: paddingHorizontal,
      fontFamily: characterCountFontFamily,
    },
    assistiveText: {
      position: 'absolute',
      color: assistiveTextColor,
      fontSize: assistiveTextFontSize,
      bottom: -assistiveTextFontSize - 7,
      left: paddingHorizontal,
      fontFamily: assistiveFontFamily,
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
    [styles.placeholder, animatedPlaceholderStyles]
  ), [styles.placeholder, animatedPlaceholderStyles]);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle, style]}>
      <TouchableWithoutFeedback onPress={handleFocus}>
        <View style={styles.inputContainer}>
          {/* Only show leftText if there is a input. Else placeholder would be on top of it. */}
          {!!leftText && !!maskedValue && <Text style={styles.leftText}>{'R$'}</Text>}
          <TextInput
            {...inputProps}
            ref={inputRef}
            style={[styles.input, inputStyle]}
            pointerEvents={isFocused() ? 'auto' : 'none'}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={(v) => onChangeText(v, true)}
            maxLength={maxLength}
            // selectionColor={errorState() ? errorColor : activeColor}
            placeholder='' // Overwrite
            value={maskedValue}
          />
        </View>
      </TouchableWithoutFeedback>
      {trailingIcon && (
        <View style={styles.trailingIcon}>{renderTrailingIcon()}</View>
      )}
      <Animated.View
        style={[styles.placeholderSpacer, animatedPlaceholderSpacerStyles]}
      />
      <Animated.View
        style={placeholderStyle}
        onLayout={handlePlaceholderLayout}
        pointerEvents='none'
      >
        <Animated.Text style={[styles.placeholderText, animatedPlaceholderTextStyles]}>
          {placeholder}
        </Animated.Text>
      </Animated.View>
      {/* Using props.maxLength as maxLength may be set by mask length. */}
      {(props.maxLength && !hideCharacterCount) && (<Text style={styles.counterText}>{`${unMaskedValue.length} / ${maxLength}`}</Text>)}
      {errorState()
        ? (<Text style={styles.errorText}>{error}</Text>)
        : (assistiveText && (<Text style={styles.assistiveText}>{assistiveText}</Text>))
      }
    </Animated.View>
  );
});