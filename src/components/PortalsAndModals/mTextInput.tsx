import { useCallback, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Keyboard, StyleSheet } from 'react-native';
import type { PartialBy, TextInputUncontrolledProps } from '../../main';
import { addPortal, mLoading, PortalView, Pressable, removePortal, Text, TextInput, useTheme, View } from '../../main';



export type ModalTextInputProps = {
  title: string;
  description?: string;
  cancelText?: string;
  submitText: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  numberOfLines?: number;
  onSubmit: (value: string) => (void | Promise<any>);
  onCancel?: () => void;
  /** Called both when submit is successfully called or on cancel. Useful to unset its visibility if using the ModalInput (and not modalInput). */
  onClose?: () => void;
  textInputProps?: TextInputUncontrolledProps;
};

export function ModalTextInput({
  onSubmit: onSubmitProp, onCancel: onCancelProp, onClose,
  title, description, submitText, cancelText = 'Cancelar', defaultValue = '', placeholder,
  maxLength, textInputProps, numberOfLines,
}: ModalTextInputProps): JSX.Element {

  const [value, setValue] = useState(defaultValue);
  const { fonts } = useTheme();

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

  return (
    <PortalView onRequestClose={onCancel} containerStyle={s.container}>
      <Text s={[s.title, fonts.medium]} t={title}/>
      {description && <Text s={s.description} t={description}/>}
      <TextInput
        type='formal'
        value={value}
        onChangeText={setValue}
        containerStyle={s.textInputContainer}
        placeholder={placeholder}
        maxLength={maxLength}
        numberOfLines={numberOfLines}
        style={{ textAlignVertical: 'top', paddingBottom: 6, paddingTop: 4, fontSize: 17 }}
        multiline={!!numberOfLines || undefined}
        {...textInputProps}
      />
      <RowButtonsCancelAndAction
        cancelText={cancelText}
        submitText={submitText}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </PortalView>
  );
}

export function RowButtonsCancelAndAction({ onCancel, onSubmit, cancelText, submitText, style }: {
  cancelText: string;
  submitText: string;
  onCancel: () => void;
  onSubmit: () => void;
  /** Style of the wrapping view */
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const { fonts } = useTheme();

  return (
    <View s={[s.pressablesView, style]}>
      <Pressable shrink s={s.pressable} onPress={onCancel}>
        <Text numberOfLines={1} adjustsFontSizeToFit s={[s.pressableText, fonts.medium]} t={cancelText}/>
      </Pressable>
      <Pressable shrink s={s.pressable} onPress={onSubmit}>
        <Text numberOfLines={1} adjustsFontSizeToFit s={[s.pressableText, fonts.medium]} t={submitText}/>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 17,
    paddingBottom: 5,
    paddingHorizontal: 18,
  },
  title: {
    color: '#333',
    fontSize: 22,
    marginBottom: 12,
  },
  description: {
    marginBottom: 12,
    fontSize: 14.5,
  },
  textInputContainer: {
    marginTop: 8,
    marginBottom: -12, // Remove unused error margin
  },
  pressablesView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pressable: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  pressableText: {
    color: '#444',
    fontSize: 15,
  },
});

export function mTextInput(props: PartialBy<ModalTextInputProps, 'onClose'>): void {
  let id = '';
  id = addPortal(<ModalTextInput {...props} onClose={() => { removePortal(id); props.onClose?.(); }}/>);
}