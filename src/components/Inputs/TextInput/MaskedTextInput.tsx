// Almost a copy from https://github.com/akinncar/react-native-mask-text
// but there is always something in his code that I want to improve

import { forwardRef, ForwardRefRenderFunction, useCallback, useEffect, useState } from 'react';
import { TextInput as RnTextInput, TextInputProps as RnTextInputProps } from 'react-native';
import { mask, unMask } from 'react-native-mask-text';
import { MaskOptions } from 'react-native-mask-text/lib/typescript/@types/MaskOptions';



type TIProps = Omit<RnTextInputProps, 'onChangeText'>;

export interface MaskedTextInputProps extends TIProps {
  mask?: string;
  type?: 'custom' | 'currency';
  options?: MaskOptions;
  defaultValue?: string;
  onChangeText: (text: string, rawText: string) => void;
  inputAccessoryView?: JSX.Element;
}

export const MaskedTextInputComponent: ForwardRefRenderFunction<
  RnTextInput,
  MaskedTextInputProps
> = (
  {
    mask: pattern,
    type = 'custom',
    options = {} as MaskOptions,
    defaultValue: defaultValueProp,
    onChangeText,
    inputAccessoryView,
    ...rest
  },
  ref,
): JSX.Element => {

  const defaultValue = defaultValueProp || (type === 'currency' ? '0' : '');

  const [maskedValue, setMaskedValue] = useState(() => (pattern !== undefined ? mask(defaultValue, pattern, type, options) : defaultValue));
  const [unMaskedValue, setUnmaskedValue] = useState(() => (pattern !== undefined ? unMask(defaultValue, type) : defaultValue));


  const onChange = useCallback((value: string) => {
    const newUnMaskedValue = pattern !== undefined ? unMask(value, type) : value;
    const newMaskedValue = pattern !== undefined ? mask(newUnMaskedValue, pattern, type, options) : value;

    setMaskedValue(newMaskedValue);
    setUnmaskedValue(newUnMaskedValue);
  }, [options, pattern, type]);

  useEffect(() => {
    onChangeText(maskedValue, unMaskedValue);
  }, [maskedValue, onChangeText, unMaskedValue]);

  return (
    <>
      <RnTextInput
        onChangeText={(value) => onChange(value)}
        ref={ref}
        maxLength={pattern?.length || undefined}
        {...rest}
        value={maskedValue}
      />
      {inputAccessoryView}
    </>
  );
};

export const MaskedTextInput = forwardRef(MaskedTextInputComponent);