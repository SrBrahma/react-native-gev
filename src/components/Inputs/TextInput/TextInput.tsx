import { useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { TextInputProps as RnTextInputProps } from 'react-native';
import { getPresetInfo, PresetIds, TextInputPreset } from './presets/presets';
import { TextInputFormal } from './TextInputFormal';





export type TextInputProps<T extends Control<any, any>> = Omit<RnTextInputProps & {
  mask?: string;
  /** If will add a basic margin bottom.
   * @default true */
  marginBottom?: boolean;
  control: T;
  /** How you will get it with react-hook-form */
  id: (keyof T['_defaultValues']) & string;
  /** User-readable name of this input. */
  label?: string;
  optional?: boolean;
  required?: boolean;
  preset?: PresetIds | TextInputPreset;
  maxLength?: number;
  pretitle?: string;
  /** Char count is shown if maxLength is defined.
   * @default false */
  hideCharacterCount?: boolean;
  errorMessage?: string;
}, 'defaultValue'>; /** defaultValue unused as we at most will use hook-form defaultValues. It sets the field value. */



export function TextInput<T extends Control<any, any>>({
  id,
  control,
  /** @default false */
  required = false,
  preset,
  // style,
  // marginBottom = true,
  ...props
}: Omit<TextInputProps<T>, 'onChangeText'>): JSX.Element {
  if (!id) throw new Error('id not set for TextInput');

  const overwriters = {
    maxLength: props.maxLength,
    mask: props.mask,
  };

  const {
    maxLength, minLength,
    mask, validations, inputProps,
    prettifyUnmasked, unmaskedToLogical, logicalToUnmasked,
  } = {
    ...(typeof preset === 'string' ? getPresetInfo(preset) : preset),
    ...(JSON.parse(JSON.stringify(overwriters)) as Partial<typeof overwriters>),
  };

  const { field, fieldState } = useController({
    name: id,
    control: control as any,
    rules: {
      required: { value: required, message: 'Requerido' },
      ...maxLength && { maxLength: { value: maxLength, message: `Excede ${maxLength} caracteres` } },
      ...minLength && { minLength: { value: minLength, message: `Mínimo ${minLength} caracteres` } },
      validate: { ...validations },
    },
  });

  /** The display value. The TextInput component should mask it, if it's the case. */
  const [unmasked, setUnmasked] = useState<string>(() => {
    const unmasked: string = logicalToUnmasked?.(field.value) ?? String(field.value ?? '');
    return prettifyUnmasked?.({ unmasked }) ?? unmasked;
  });

  const onBlur = (): void => {
    if (prettifyUnmasked && !fieldState.error)
      setUnmasked(prettifyUnmasked({ unmasked: unmasked }) ?? unmasked);
    field.onBlur();
  };
  const onChangeText = (masked: string, unmasked: string) => {
    const logicalValue: string | number = unmaskedToLogical?.({ unmasked }) ?? unmasked;
    field.onChange(logicalValue);
    setUnmasked(unmasked);
  };

  const commonProps = {
    value: unmasked,
    numberOfLines: 1,
    error: props.errorMessage ?? (fieldState.error ? String(fieldState.error.message) : undefined),
    ...inputProps, // by preset
    ...props, // defined props will overwrite above but not below
    onChangeText,
    onBlur,
    maxLength,
    mask: typeof mask === 'function' ? mask({ unmasked }) : mask,
  };
  return <TextInputFormal {...commonProps}/>;
  // return <InputOutline
  //   selectionColor='#ffb12090' // The blinking cursor
  //   style={[s.textInput, marginBottom && { marginBottom: 28 }, style]}
  //   numberOfLines={1}
  //   fontSize={18}
  //   characterCountFontSize={12}
  // />;
}