import { useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import Dialog from 'react-native-dialog';
import { addModal, PartialBy, removeModal } from './ModalBase';
import { modalLoading } from './modalLoading';



type ModalInputProps = {
  onSubmit: (value: string) => (void | Promise<any>);
  title: string;
  description?: string;
  submitText: string;
  defaultValue?: string;
  onCancel: () => void;
  /** @default true */
  // autoFocus?: boolean;
  // minLength: number;
  // maxLength: number;
};

function ModalInput({ onSubmit, submitText, title, description, onCancel, defaultValue = '' }: ModalInputProps): JSX.Element {
  const [value, setValue] = useState(defaultValue);

  return (
    <Dialog.Container
      visible
      onBackdropPress={onCancel}
      onRequestClose={onCancel}
      contentStyle={{ paddingHorizontal: 10 }}
      footerStyle={Platform.OS === 'android' && { justifyContent: 'space-between', paddingHorizontal: 6 }}
    >
      <Dialog.Title children={title}/>
      {description && <Dialog.Description children={description} style={{ marginBottom: 4 }}/>}
      <Dialog.Input value={value} onChangeText={setValue} style={{ fontSize: 20 }}/>
      <Dialog.Button onPress={onCancel} label='Cancelar'/>
      <Dialog.Button onPress={async () => {
        Keyboard.dismiss();
        await modalLoading(async () => {
          await onSubmit(value.trim());
          onCancel();
        });
      }} label={submitText}/>
    </Dialog.Container>
  );
}


export function modalInput(props: PartialBy<ModalInputProps, 'onCancel'>): void {
  const component = <ModalInput {...props} onCancel={() => {removeModal(component); props.onCancel?.();}}/>;

  addModal(component);
}