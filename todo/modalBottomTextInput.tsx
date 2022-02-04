import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { addModalOrPortal, PartialBy, removeModalOrPortal } from './ModalBase';


// Property keyboardShouldPersistTaps={true} not working in <Modal /> - https://github.com/facebook/react-native/issues/10138#issuecomment-304344283



export type BottomInputProps = {
  title: string;
  subtitle?: string;
  onCancel: () => any;
  onConfirmation: (value: string) => any;
  defaultValue?: string | number;
  inputProps?: Omit<TextInputProps, 'defaultValue'>;
  inputType?:
  /** Only [0-9] chars, may be negative. */
  // 'integer' |
  /** Only [0-9] chars, can't be negative. */
  'positiveInteger'
    // | 'uppercaseAndInt' // Only allows letters and integers. Converts lowercase to uppercase
  ;
};



export const BottomInput: React.FC<BottomInputProps> = ({
  title,
  subtitle,
  inputType,
  defaultValue,
  onCancel, onConfirmation,
  ...rest
}) => {
  const [value, setValue] = useState(String(defaultValue ?? ''));
  const inputRef = useRef<TextInput>(null);

  // For some reason, the keyboard wasn't being auto-activated sometimes.
  // This timeout workaround is also used by others (link?).
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150); // update ahive: Still required?
  }, []);

  // Autoclose on keyboard dissmiss (like pressing back button)
  useEffect(() => {
    return Keyboard.addListener('keyboardDidHide', () => onCancel()).remove;
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

  return (
    <Modal
      transparent
      // statusBarTranslucent // statusBarTranslucent would mess KeyboardAvoidingView
      onRequestClose={onCancel}
      animationType='fade'
    >
      {/* add statusBar color mixing later as we can't use statusBarTranslucent*/}
      {/* <StatusBar /> */}
      {/* ScrollView would throw VirtualizedLists should never be nested inside plain ScrollViews */}
      {/* We need the scroll to have keyboardShouldPersistTaps */}
      {/* <PageScrollView flatList> */}
      <Pressable style={[s.back, C.backdrop]} onPress={onCancel}>
        <KeyboardAvoidingView
          // https://reactnative.dev/docs/keyboardavoidingview but 'height' for android was messing the positioning sometimes.
          // I was looking at react-native-modal code and they use that undefined for android, and fixed the issue.
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.bottomView}
        >
          <Shadow sides={['top']} corners={['topLeft', 'topRight']} viewStyle={s.container}>
            <Pressable onPress={() => null}>
              <ScrollView keyboardShouldPersistTaps='always'>
                <Text style={s.label}>{title}</Text>
                {subtitle && <Text style={s.subLabel}>{subtitle}</Text>}
                <TextInput
                  onSubmitEditing={() => onConfirmation(value)}
                  placeholderTextColor='#aaa'
                  style={s.textInput}
                  {... (inputType === 'positiveInteger') && { keyboardType: 'number-pad' }}
                  onChangeText={(e) => onChangeCb(e)}
                  value={value}
                  // FIXME: It's going through the text, fix its positioning.
                  underlineColorAndroid='#444'
                  selectTextOnFocus // Selects all the text automatically. Won't start keyboard, we have the useEffect for that.
                  ref={inputRef}
                  {...rest}
                />

                <View style={s.buttons}>
                  <Pressable style={s.button} android_ripple={{ color: '#0001' }} onPress={onCancel}>
                    <Text style={s.buttonText}>{'Cancelar'}</Text>
                  </Pressable>
                  <Pressable style={s.button} android_ripple={{ color: '#0001' }} onPress={() => onConfirmation(value)}>
                    <Text style={s.buttonText}>{'Salvar'}</Text>
                  </Pressable>
                </View>

              </ScrollView>
            </Pressable>
          </Shadow>

        </KeyboardAvoidingView>
      </Pressable>
      {/* </PageScrollView> */}
    </Modal>
  );
};


// {/* Pressable inside to ignore touches inside. Dismiss needed here for some reason to blur input */}
// <Pressable style={[s.container, containerStyle]} onPress={() => Keyboard.dismiss()}>
// {/* This padding because absolute stuff were being cropped */}
// <PageScrollView viewStyle={[{ padding: 5 }, contentStyle]} {...scrollViewProps} nestedScrollEnabled>
//   {/* Without this internal pressable (RN 0.64), the scroll rarely works. https://stackoverflow.com/a/57960538/10247962 */}
//   <Pressable onPress={() => Keyboard.dismiss()}>
//     {children}
//   </Pressable>
// </PageScrollView>
// </Pressable>



const s = StyleSheet.create({
  back: {
    width: '100%',
    height: '100%',
  },
  bottomView: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  container: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    paddingTop: 28,
    paddingBottom: 14,
    paddingLeft: 24,
    paddingRight: 18,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  label: {
    color: '#444',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subLabel: {
    marginTop: 2,
    color: '#444',
    marginLeft: 4,
    fontSize: 14,
  },
  textInput: {
    fontSize: 16,
    marginTop: 18,
    marginBottom: 16,
    marginRight: 40,
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
  buttonText: {
    fontSize: 15,
    color: C.main,
    fontWeight: 'bold',
  },
});

export function modalBottomInput(props: PartialBy<BottomInputProps, 'onCancel'>): void {
  const component = <BottomInput {...props}
    onCancel={() => { removeModalOrPortal(component); props.onCancel?.(); }}
    onConfirmation={(v) => { removeModalOrPortal(component); props.onConfirmation(v); }}
  />;

  addModalOrPortal(component);
}