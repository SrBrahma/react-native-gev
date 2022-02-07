import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '../../..';
import { MaskedTextInput } from './MaskedTextInput';
import type { CommonTextInputPros } from './TextInput';





export function TextInputFormal({
  label, error, containerStyle, errorStyle, ...inputProps
}: CommonTextInputPros): JSX.Element {
  const theme = useTheme();

  return (
    <View style={containerStyle}>
      {label && <Text t={label} s={s.label}/>}
      <MaskedTextInput
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
        {...inputProps}
        style={[s.textInput, inputProps.style]}
      />
      <Text t={error ?? ''} s={[s.errorMessage, { color: theme.colors.error }, errorStyle]}/>
    </View>
  );
}


const s = StyleSheet.create({
  label: {
    fontSize: 16,
    fontFamily: 'Roboto_500Medium', // TODO
    // fontFamily: F.Roboto_500Medium,
    marginBottom: 4,
  },
  textInput: {
    borderRadius: 1.5,
    fontSize: 18,
    borderColor: '#666',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  errorMessage: {
    fontSize: 14,
    paddingVertical: 2,
  },
});
