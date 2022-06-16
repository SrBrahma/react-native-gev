import { forwardRef } from 'react';
import type { TextInput } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '../../../main';
import { MaskedTextInput } from './MaskedTextInput';
import type { CommonTextInputProps } from './TextInput';


/** Basic. Label on top, placeholder, error on bottom. */
export const TextInputFormal = forwardRef<TextInput, CommonTextInputProps>(({
  label, error, containerStyle, contentStyle, errorStyle, inputRef,
  labelStyle, rightComponent, style,
  sublabel, sublabelStyle,
  ...inputProps
}, ref) => {
  const theme = useTheme();

  return (
    <View style={containerStyle}>
      {label && <Text s={[theme.styles.label, labelStyle]} t={label}/>}
      {sublabel && <Text s={[theme.styles.sublabel, sublabelStyle]} t={sublabel}/>}
      <View style={[s.content, !!error && { borderColor: theme.colors.error }, contentStyle]}>
        <MaskedTextInput
          ref={ref}
          placeholderTextColor={theme.colors.placeholder}
          selectionColor={theme.colors.primary}
          style={[s.textInput, style]}
          {...inputProps}
        />
        <View style={s.rightComponent}>{rightComponent}</View>
      </View>
      <Text s={[s.errorMessage, { color: theme.colors.error }, theme.fonts.medium, errorStyle]} t={error ?? ''}/>
    </View>
  );
});


const s = StyleSheet.create({
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#bbb',
    paddingHorizontal: 8, // Includes textInput and rightComponent
    borderWidth: 1,
    borderRadius: 1.5,
  },
  textInput: {
    flex: 1, // Use all the available horizontal space to auxiliate TextInput selection.
    paddingVertical: 4,
    includeFontPadding: false,
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
