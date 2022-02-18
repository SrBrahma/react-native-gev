import type { Ref } from 'react';
import { useState } from 'react';
import { useController } from 'react-hook-form';
import type { StyleProp, TextInput as RnTextInput, TextStyle, ViewStyle } from 'react-native';
import type { Control } from '../utils';
import { isControlled } from '../utils';
import type { Mask, PresetIds, TextInputPreset, Validations } from './presets/presets';
import { getPreset } from './presets/presets';
import type { MaskedTextInputProps } from './MaskedTextInput';
import { TextInputFormal } from './TextInputFormal';
import { TextInputOutline } from './TextInputOutline';




/** The TextInput custom components have this. */
export type CommonTextInputProps = Partial<MaskedTextInputProps & {
  /** User-readable name of this input. */
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorStyle?: StyleProp<TextStyle>;
  /** As our TextInput may have other refs in the future and ref forwarding is bad when having generics components,
   * the TextInput ref is used with this prop. */
  inputRef?: Ref<RnTextInput>;
}>;



type Kind = 'formal' | 'outline';


export type TextInputUncontrolledProps = CommonTextInputProps & {
  mask?: Mask;
  /** If will add a basic margin bottom.
   * @default true */
  marginBottom?: boolean;
  maxLength?: number;
  /** Char count is shown if maxLength is defined.
   * @default false */
  hideCharacterCount?: boolean;
  error?: string;
  /** If you want to use a custom component. */
  Component?: (p: CommonTextInputProps) => JSX.Element;
  kind?: Kind;
};

function TextInputUncontrolled(p: TextInputUncontrolledProps): JSX.Element {
  const commonProps: CommonTextInputProps = {
    numberOfLines: 1,
    ...p, // defined props will overwrite above but not below
    accessibilityLabel: p.label,
  };

  return TextInputComponentSelector({ commonProps, Component: p.Component, kind: p.kind });
}



type Id<T extends Control> = (keyof T['_defaultValues']) & string;

export type TextInputControlledProps<T extends Control = Control> = Omit<CommonTextInputProps & {
  control: T;
  /** How you will get it with react-hook-form */
  id: Id<T>;
  /** An object that relates the `id` prop to the `label` prop for this TextInput. */
  idToLabel?: Record<Id<T>, string>;
  /** @default false */
  required?: boolean;
  preset?: PresetIds | TextInputPreset;
  validations?: Validations;
} & TextInputUncontrolledProps,
  'defaultValue'>; /** defaultValue unused as we at most will use hook-form defaultValues. It sets the field value. */

export function TextInputControlled<T extends Control>({
  id,
  control,
  /** @default false */
  required = false,
  preset,
  label: labelProp,
  idToLabel,
  Component,
  onChangeText: onChangeProp,
  validations: validationsProp,
  kind,
  ...p
}: TextInputControlledProps<T>): JSX.Element {
  if (!id) throw new Error('id prop not set for controlled TextInput!');

  const label = labelProp ?? idToLabel?.[id] ?? id;

  const overwriters = {
    maxLength: p.maxLength,
    mask: p.mask,
  };

  const {
    maxLength, minLength,
    mask, validations, inputProps,
    prettifyUnmasked, unmaskedToLogical, logicalToUnmasked,
  } = {
    ...(typeof preset === 'string' ? getPreset(preset) : preset),
    ...(JSON.parse(JSON.stringify(overwriters)) as Partial<typeof overwriters>),
  };

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

  const commonProps: CommonTextInputProps = {
    label,
    value: unmasked,
    numberOfLines: 1,
    error: p.error ?? (fieldState.error ? String(fieldState.error.message) : undefined),
    ...inputProps, // by preset
    ...p, // defined props will overwrite above but not below
    onChangeText,
    onBlur,
    maxLength,
    mask: typeof mask === 'function' ? mask({ unmasked }) : mask,
    accessibilityLabel: label,
  };

  return TextInputComponentSelector({ commonProps, Component, kind });
}


export type TextInputProps<T extends Control = Control> = TextInputUncontrolledProps | TextInputControlledProps<T>;

/**
 * `label`, a text that will show up identifying the TextInput, defaults to `idToLabel?.[id]`, and then to `id`.
 *
 * `accessibilityLabel` defaults to `label`, as it's useful for unit tests.
 */
export function TextInput<T extends Control = Control>({
  kind = 'formal',
  ...p
}: TextInputProps<T>): JSX.Element {
  return isControlled(p)
    ? <TextInputControlled {...p as TextInputControlledProps<T>} kind={kind}/>
    : <TextInputUncontrolled {...p} kind={kind}/>;
}


function TextInputComponentSelector({
  Component, kind, commonProps,
}: {
  Component?: (p: CommonTextInputProps) => JSX.Element;
  kind?: Kind;
  commonProps: CommonTextInputProps;
}) {
  if (Component)
    return <Component {...commonProps}/>;

  switch (kind) {
    case 'outline': return <TextInputOutline placeholder={commonProps.label} {...commonProps}/>;
    case 'formal':
    default: return <TextInputFormal {...commonProps}/>;
  }
}