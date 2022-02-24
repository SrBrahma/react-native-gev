import { forwardRef } from 'react';
import type { TextInput } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '../../../main';
import { MaskedTextInput } from './MaskedTextInput';
import type { CommonTextInputProps } from './TextInput';


/** Basic. Label on top, placeholder, error on bottom. */
export const TextInputFormal = forwardRef<TextInput, CommonTextInputProps>(({
  label, error, containerStyle, contentStyle, errorStyle, inputRef,
  labelStyle, rightComponent,
  ...inputProps
}, ref) => {
  const theme = useTheme();
  return (
    <View style={containerStyle}>
      {label && <Text t={label} s={[s.label, theme.fonts.medium, labelStyle]}/>}
      <View style={[s.row, !!error && { borderColor: theme.colors.error }, contentStyle]}>
        <MaskedTextInput
          ref={ref}
          placeholderTextColor={theme.colors.placeholder}
          selectionColor={theme.colors.primary}
          {...inputProps}
          style={[s.textInput, inputProps.style]}
        />
        {rightComponent}
      </View>
      <Text t={error ?? ''} s={[s.errorMessage, { color: theme.colors.error }, theme.fonts.medium, errorStyle]}/>
    </View>
  );
});


const s = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    borderColor: '#bbb',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 1.5,
  },
  textInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 18,
  },
  errorMessage: {
    fontSize: 13,
    marginLeft: 8,
    paddingTop: 6,
    paddingBottom: 7,
  },
});
