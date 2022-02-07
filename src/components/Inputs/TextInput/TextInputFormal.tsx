import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '../../..';
import { MaskedTextInput, MaskedTextInputProps } from './MaskedTextInput';



type CommonTextInputPros = MaskedTextInputProps & {
  label?: string;
  error?: string;
};

export function TextInputFormal({ label, style, error, ...p }: CommonTextInputPros): JSX.Element {
  const theme = useTheme();

  return (
    <View>
      {label && <Text t={label} s={s.label}/>}
      <MaskedTextInput
        {...p}
        style={[s.textInput, style]}
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.primary}
      />
      <Text t={error ?? ''} s={s.errorMessage}/>
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
    fontSize: 16,
  },
});
