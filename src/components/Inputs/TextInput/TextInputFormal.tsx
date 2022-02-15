import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '../../../main';
import { MaskedTextInput } from './MaskedTextInput';
import type { CommonTextInputPros } from './TextInput';



export function TextInputFormal({
  label, error, containerStyle, errorStyle, ...inputProps
}: CommonTextInputPros): JSX.Element {
  const theme = useTheme();

  return (
    <View style={containerStyle}>
      {label && <Text t={label} s={[s.label, theme.fonts.medium]}/>}
      <MaskedTextInput
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        {...inputProps}
        style={[s.textInput, !!error && { borderColor: theme.colors.error }, inputProps.style]}
      />
      <Text t={error ?? ''} s={[s.errorMessage, { color: theme.colors.error }, theme.fonts.medium, errorStyle]}/>
    </View>
  );
}


const s = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  textInput: {
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
