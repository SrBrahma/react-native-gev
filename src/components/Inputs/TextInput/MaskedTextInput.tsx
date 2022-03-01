// Almost a copy from https://github.com/akinncar/react-native-mask-text
// but there is always something in his code that I want to improve

import { forwardRef, useCallback, useEffect, useState } from 'react';
import type { TextInputProps as RnTextInputProps } from 'react-native';
import { TextInput as RnTextInput } from 'react-native';
import { mask, unMask } from 'react-native-mask-text';
import type { MaskOptions } from 'react-native-mask-text/lib/typescript/@types/MaskOptions';



// /** May be a function, where the param is the current value and it must return its mask. */
export type Mask = string;// | ((p: {unmasked: string}) => string);
// Removed function for now. Back then it was called outside this MaskedTextInput. Add later again inside it.
// we used this on TextInputControlled: mask: typeof mask === 'function' ? mask({ unmasked }) : mask,

type TIProps = Omit<RnTextInputProps, 'onChangeText'>;

export type MaskedTextInputProps = TIProps & {
  mask?: Mask;
  maskType?: 'custom' | 'currency';
  options?: MaskOptions;
  defaultValue?: string;
  onChangeText?: (text: string, rawText: string) => void;
};

export const MaskedTextInput = forwardRef<RnTextInput, MaskedTextInputProps>(({
  mask: pattern,
  maskType = 'custom',
  options = {} as MaskOptions,
  defaultValue: defaultValueProp,
  onChangeText,
  ...rest
}, ref) => {

  const defaultValue = defaultValueProp || (maskType === 'currency' ? '0' : '');

  const hasMask = (pattern !== undefined || maskType === 'currency');

  const [maskedValue, setMaskedValue] = useState(() => (hasMask ? mask(defaultValue, pattern, maskType, options) : defaultValue));
  const [unMaskedValue, setUnmaskedValue] = useState(() => (hasMask ? unMask(defaultValue, maskType) : defaultValue));


  const onChange = useCallback((value: string) => {
    const newUnMaskedValue = hasMask ? unMask(value, maskType) : value;
    const newMaskedValue = hasMask ? mask(newUnMaskedValue, pattern, maskType, options) : value;

    setMaskedValue(newMaskedValue);
    setUnmaskedValue(newUnMaskedValue);
  }, [hasMask, maskType, pattern, options]);

  useEffect(() => {
    onChangeText?.(maskedValue, unMaskedValue);
  }, [maskedValue, onChangeText, unMaskedValue]);

  return (
    <RnTextInput
      onChangeText={(value) => onChange(value)}
      ref={ref}
      maxLength={pattern?.length || undefined}
      {...rest}
      value={maskedValue}
    />
  );
});