import { forwardRef, useMemo } from 'react';
import type { TextInput } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '../../../main';
import { MaskedTextInput } from './MaskedTextInput';
import type { CommonTextInputProps } from './TextInput';


/** Basic. Label on top, placeholder, error on bottom. */
export const TextInputFormal = forwardRef<TextInput, CommonTextInputProps>(({
  label, error, containerStyle, contentStyle, errorStyle, inputRef,
  labelStyle, rightComponent, style,
  ...inputProps
}, ref) => {
  const theme = useTheme();
  const labelStyleMemo = useMemo(() => [s.label, theme.fonts.medium, labelStyle], [labelStyle, theme]);
  const contentStyleMemo = useMemo(() => [s.content, !!error && { borderColor: theme.colors.error }, contentStyle], [contentStyle, error, theme]);
  const textInputMemo = useMemo(() => [s.textInput, style], [style]);
  const errorStyleMemo = useMemo(() => [s.errorMessage, { color: theme.colors.error }, theme.fonts.medium, errorStyle], [errorStyle, theme]);
  return (
    <View style={containerStyle}>
      {label && <Text t={label} s={labelStyleMemo}/>}
      <View style={contentStyleMemo}>
        <MaskedTextInput
          ref={ref}
          placeholderTextColor={theme.colors.placeholder}
          selectionColor={theme.colors.primary}
          style={textInputMemo}
          {...inputProps}
        />
        <View style={s.rightComponent}>{rightComponent}</View>
      </View>
      <Text t={error ?? ''} s={errorStyleMemo}/>
    </View>
  );
});


const s = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#bbb',
    paddingHorizontal: 8, // Includes textInput and rightComponent
    borderWidth: 1,
    borderRadius: 1.5,
  },
  textInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 18,
  },
  rightComponent: {
    justifyContent: 'center',
  },
  errorMessage: {
    fontSize: 13,
    marginLeft: 8,
    paddingTop: 6,
    paddingBottom: 7,
  },
});
