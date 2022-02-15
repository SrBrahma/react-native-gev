import { useState } from 'react';
import type { Control } from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { Mask, PresetIds, TextInputPreset, Validations } from './presets/presets';
import { getPreset } from './presets/presets';
import type { MaskedTextInputProps } from './MaskedTextInput';
import { TextInputFormal } from './TextInputFormal';
import { TextInputOutline } from './TextInputOutline';



export type CommonTextInputPros = MaskedTextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorStyle?: StyleProp<TextStyle>;
};


type Id<T extends Control<any, any>> = (keyof T['_defaultValues']) & string;
export type TextInputProps<T extends Control<any, any>> = Omit<Partial<CommonTextInputPros> & {
  control: T;
  /** How you will get it with react-hook-form */
  id: Id<T>;
  /** An object that relates the `id` prop to the `label` prop for this TextInput. */
  idToLabel?: Record<Id<T>, string>;
  mask?: Mask;
  /** If will add a basic margin bottom.
   * @default true */
  marginBottom?: boolean;
  /** User-readable name of this input. */
  label?: string;
  /** @default false */
  required?: boolean;
  preset?: PresetIds | TextInputPreset;
  maxLength?: number;
  /** Char count is shown if maxLength is defined.
   * @default false */
  hideCharacterCount?: boolean;
  errorMessage?: string;
  /** If you want to use a custom component. */
  component?: (p: CommonTextInputPros) => JSX.Element;
  validations?: Validations;
  kind?: 'formal' | 'outline';
}, 'defaultValue'>; /** defaultValue unused as we at most will use hook-form defaultValues. It sets the field value. */


/**
 * `label`, a text that will show up identifying the TextInput, defaults to `idToLabel?.[id]`, and then to `id`.
 *
 * `accessibilityLabel`, used for tests, defaults to `label`.
 */
export function TextInput<T extends Control<any, any>>({
  id,
  control,
  /** @default false */
  required = false,
  preset,
  label: labelProp,
  idToLabel,
  component,
  onChangeText: onChangeProp,
  validations: validationsProp,
  // marginBottom = true,
  kind = 'formal',
  ...props
}: TextInputProps<T>): JSX.Element {
  if (!id) throw new Error('id not set for TextInput');

  const label = labelProp ?? idToLabel?.[id] ?? id;

  const overwriters = {
    maxLength: props.maxLength,
    mask: props.mask,
  };

  const {
    maxLength, minLength,
    mask, validations, inputProps,
    prettifyUnmasked, unmaskedToLogical, logicalToUnmasked,
  } = {
    ...(typeof preset === 'string' ? getPreset(preset) : preset),
    ...(JSON.parse(JSON.stringify(overwriters)) as Partial<typeof overwriters>),
  };

  /** Apply form values to the validations. */
  // const validations2: Record<string, Validate<any>> = Object.fromEntries(
  //   Object
  //     .entries(validations ?? {})
  //     .map(([id, validation]) => [id, (v: any) => validation(v, control._formValues)]));

  const { field, fieldState } = useController({
    name: id,
    control: control as any,
    rules: {
      required: { value: required, message: 'Requerido' },
      ...maxLength && { maxLength: { value: maxLength, message: `Excede ${maxLength} caracteres` } },
      ...minLength && { minLength: { value: minLength, message: `Mínimo ${minLength} caracteres` } },
      validate: {
        ...validations,
        ...validationsProp,
      },
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
    onChangeProp?.(masked, unmasked);
  };

  const commonProps: CommonTextInputPros = {
    label,
    value: unmasked,
    numberOfLines: 1,
    error: props.errorMessage ?? (fieldState.error ? String(fieldState.error.message) : undefined),
    ...inputProps, // by preset
    ...props, // defined props will overwrite above but not below
    onChangeText,
    onBlur,
    maxLength,
    mask: typeof mask === 'function' ? mask({ unmasked }) : mask,
    accessibilityLabel: label,
  };

  if (component)
    return component(commonProps);

  switch (kind) {
    case 'outline': return <TextInputOutline {...commonProps}/>;
    case 'formal':
    default: return <TextInputFormal {...commonProps}/>;
  }
  // return <InputOutline
  //   selectionColor='#ffb12090' // The blinking cursor
  //   style={[s.textInput, marginBottom && { marginBottom: 28 }, style]}
  //   fontSize={18}
  //   characterCountFontSize={12}
  // />;
}