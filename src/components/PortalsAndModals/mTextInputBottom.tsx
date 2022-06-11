import { useCallback, useEffect, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import type { PartialBy, TextInputProps } from '../../main';
import { addPortal, mLoading, PortalBottomView, Pressable, removePortal, Text, TextInput, useTheme, View } from '../../main';


// Property keyboardShouldPersistTaps={true} not working in <Modal /> - https://github.com/facebook/react-native/issues/10138#issuecomment-304344283



export type TextInputBottomProps = {
  title: string;
  subtitle?: string;
  onCancel?: () => any;
  onSubmit: (value: string) => any;
  defaultValue?: string | number;
  inputProps?: Omit<TextInputProps, 'defaultValue'>;
  /** Called both when submit is successfully called or on cancel. Useful to unset its visibility. */
  onClose?: () => void;
  inputType?:
  /** Only [0-9] chars, may be negative. */
  // 'integer' |
  /** Only [0-9] chars, can't be negative. */
  'positiveInteger'
    // | 'uppercaseAndInt' // Only allows letters and integers. Converts lowercase to uppercase
  ;
};



export const TextInputBottom: React.FC<TextInputBottomProps> = ({
  title,
  subtitle,
  inputType,
  defaultValue,
  onSubmit: onSubmitProp,
  onCancel: onCancelProp,
  onClose,
  ...rest
}) => {
  const theme = useTheme();
  const [value, setValue] = useState(String(defaultValue ?? ''));
  // const inputRef = useRef<typeof TextInput>(null);

  // For some reason, the keyboard wasn't being auto-activated sometimes.
  // This timeout workaround is also used by others (link?).
  // useEffect(() => {
  //   setTimeout(() => inputRef.current?.focus(), 150); // update ahive: Still required?
  // }, []);

  const onCancel = useCallback(() => {
    onCancelProp?.();
    onClose?.();
  }, [onCancelProp, onClose]);

  const onSubmit = useCallback(async () => {
    Keyboard.dismiss();
    await mLoading(async () => {
      await onSubmitProp(value.trim());
      onClose?.();
    });
  }, [onClose, onSubmitProp, value]);

  // Autoclose on keyboard dissmiss (like pressing back button)
  useEffect(() => {
    return Keyboard.addListener('keyboardDidHide', onCancel).remove;
  }, [onCancel]);

  const onChangeCb = useCallback((valueParam: string) => {
    let str;
    switch (inputType) {
      case undefined:
        str = valueParam;
        break;
      // FIXME
      // case 'integer':
      // // Remove any '-' preceeded by anything or not number/-
      //   str = valueParam.replace(/((?<=.)-)|[^0-9-]/g, ''); // Throwing error on build
      //   break;
      case 'positiveInteger':
        str = valueParam.replace(/[^0-9]/g, '');
        break;
      // Bugged, toUpperCase is fucking up
    // case 'uppercaseAndInt':
    //   str = valueParam.toUpperCase();
    //   break;
    }
    setValue(str);
  }, [inputType]);

  const styles = StyleSheet.create({
    buttonText: {
      fontSize: 15,
      fontFamily: theme.fonts.bold.fontFamily,
      color: theme.colors.primary,
    },
  });

  return (
    <PortalBottomView onRequestClose={onCancel} containerStyle={s.container}>
      <Text style={[s.label, { fontFamily: theme.fonts.bold.fontFamily }]}>{title}</Text>
      {subtitle && <Text style={s.subLabel}>{subtitle}</Text>}
      <TextInput
        onSubmitEditing={onSubmit}
        placeholderTextColor='#aaa'
        containerStyle={s.textInputContainer}
        style={s.textInput}
        {... (inputType === 'positiveInteger') && { keyboardType: 'number-pad' }}
        onChangeText={(e) => onChangeCb(e)}
        value={value}
        placeholder='Valor'
        selectTextOnFocus // Selects all the text automatically. Won't start keyboard, we have the useEffect for that.
        // ref={inputRef}
        {...rest}
      />

      <View style={s.buttons}>
        <Pressable style={s.button} android_ripple={{ color: '#0001' }} onPress={onCancel}>
          <Text style={styles.buttonText}>{'Cancelar'}</Text>
        </Pressable>
        <Pressable style={s.button} android_ripple={{ color: '#0001' }} onPress={onSubmit}>
          <Text style={styles.buttonText}>{'Salvar'}</Text>
        </Pressable>
      </View>
    </PortalBottomView>
  );
};



const s = StyleSheet.create({
  container: {
    paddingTop: 28,
    paddingBottom: 14,
    paddingLeft: 24,
    paddingRight: 18,
  },
  label: {
    color: '#444',
    marginLeft: 4,
    fontSize: 16,
  },
  subLabel: {
    marginTop: 2,
    color: '#444',
    marginLeft: 4,
    fontSize: 14,
  },
  textInput: {
    fontSize: 16,
  },
  textInputContainer: {
    marginTop: 18,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 10,
  },
});

export function mTextInputBottom(props: PartialBy<TextInputBottomProps, 'onCancel'>): void {
  let id = '';
  id = addPortal(
    <TextInputBottom {...props} onClose={() => { removePortal(id); props.onClose?.(); }}/>,
  );
}