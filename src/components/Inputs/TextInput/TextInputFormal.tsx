import { forwardRef } from 'react';
import type { TextInput } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '../../../main';
import { MaskedTextInput } from './MaskedTextInput';
import type { CommonTextInputProps } from './TextInput';



export const TextInputFormal = forwardRef<TextInput, CommonTextInputProps>(({
  label, error, containerStyle, errorStyle, inputRef, ...inputProps
}, ref) => {
  const theme = useTheme();
  return (
    <View style={containerStyle}>
      {label && <Text t={label} s={[s.label, theme.fonts.medium]}/>}
      <MaskedTextInput
        ref={ref}
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        {...inputProps}
        style={[s.textInput, !!error && { borderColor: theme.colors.error }, inputProps.style]}
      />
      <Text t={error ?? ''} s={[s.errorMessage, { color: theme.colors.error }, theme.fonts.medium, errorStyle]}/>
    </View>
  );
});


const s = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    borderRadius: 1.5,
    fontSize: 18,
    borderColor: '#bbb',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  errorMessage: {
    fontSize: 13,
    marginLeft: 8,
    paddingTop: 6,
    paddingBottom: 7,
  },
});
