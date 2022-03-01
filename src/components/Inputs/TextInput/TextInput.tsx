import type { Ref } from 'react';
import { useMemo, useState } from 'react';
import { useController } from 'react-hook-form';
import type { StyleProp, TextInput as RnTextInput, TextStyle, ViewStyle } from 'react-native';
import type { MayBeFunction } from '../../../internalUtils/defaultProps';
import { propsMerger, useGetDefaultProps } from '../../../internalUtils/defaultProps';
import type { OmitKey } from '../../../internalUtils/types';
import { useTheme } from '../../../main';
import type { Control } from '../utils';
import { isControlled } from '../utils';
import type { PresetIds, TextInputPreset, Validations } from './presets/presets';
import { getPreset } from './presets/presets';
import type { MaskedTextInputProps } from './MaskedTextInput';
import { TextInputFormal } from './TextInputFormal';




/** The TextInput components are given this. */
export interface CommonTextInputProps extends Partial<MaskedTextInputProps> {
  /** The style of the view that contains everything. */
  containerStyle?: StyleProp<ViewStyle>;
  /** The style of the view that contains the TextInput and rightComponent. Set here the color and radius! */
  contentStyle?: StyleProp<ViewStyle>;
  /** User-readable name of this input. */
  label?: string;
  /** Label's style */
  labelStyle?: StyleProp<TextStyle>;
  error?: string;
  errorStyle?: StyleProp<TextStyle>;
  /** As our TextInput may have other refs in the future and ref forwarding is bad when having generics components,
   * the TextInput ref is used with this prop. */
  inputRef?: Ref<RnTextInput>;
  leftText?: string;
  rightComponent?: JSX.Element;
  /** Hide char count, that is automatically displayed if maxLength is defined.
   * @default false */
  hideCharacterCount?: boolean;
}



export type TextInputType = 'formal' | 'outline';

type TextInputTypeProps = Record<TextInputType, Partial<Omit<TextInputUncontrolledProps, 'typeProps'>>>;

export interface TextInputUncontrolledProps extends CommonTextInputProps {
  /** If you want to use a custom component. */
  Component?: (p: CommonTextInputProps) => JSX.Element;
  /** A record to customize the props for the given TextInput type.
   *
   * Intended to be used by theme.props. */
  typeProps?: TextInputTypeProps;
  type?: TextInputType;
}

/** If a function, it's run as a React Hook. */
export type TextInputPropsTheme = MayBeFunction<Partial<OmitKey<TextInputUncontrolledProps, 'inputRef' | 'testID' | 'nativeID' | 'defaultValue'>>>;

function TextInputUncontrolled(props: TextInputUncontrolledProps): JSX.Element {
  const theme = useTheme();
  const defaultProps = useGetDefaultProps(theme.defaultProps.TextInput);
  const type = props.type ?? defaultProps.type ?? 'formal';

  const {
    Component = TextInputFormal,
    type: _,
    ...p
  } = useMemo(() => propsMerger({
    props: [defaultProps, defaultProps.typeProps?.[type], props],
    stylesKeys: ['style', 'errorStyle', 'labelStyle', 'containerStyle', 'contentStyle'],
  }), [props, defaultProps, type]);

  const commonProps: CommonTextInputProps = {
    numberOfLines: 1,
    accessibilityLabel: p.label,
    ...p,
  };

  return <Component {...commonProps}/>;
}

type Id<T extends Control> = (keyof T['_defaultValues']) & string;

export type TextInputControlledProps<T extends Control = Control> = Omit<TextInputUncontrolledProps & {
  control: T;
  /** How you will get it with react-hook-form */
  id: Id<T>;
  /** An object that relates the `id` prop to the `label` prop for this TextInput. */
  idToLabel?: Record<Id<T>, string>;
  /** @default false */
  required?: boolean;
  preset?: PresetIds | TextInputPreset;
  validations?: Validations;
}, 'defaultValue'>; /** defaultValue unused as we at most use hook-form defaultValues. It sets the field value. */
export function TextInputControlled<T extends Control>(props: TextInputControlledProps<T>): JSX.Element {
  const theme = useTheme();
  const defaultProps = useGetDefaultProps(theme.defaultProps.TextInput);

  const type = props.type ?? defaultProps.type ?? 'formal';

  const {
    id,
    control,
    required = false,
    preset,
    label: labelProp,
    idToLabel,
    Component = TextInputFormal,
    onChangeText: onChangeProp,
    validations: validationsProp,
    type: _,
    ...p
  } = useMemo(() => propsMerger<TextInputControlledProps>({
    props: [defaultProps, defaultProps.typeProps?.[type], props],
    stylesKeys: ['style', 'errorStyle', 'labelStyle', 'containerStyle', 'contentStyle'],
  }), [props, defaultProps, type]);

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
    const unmasked: string = String(logicalToUnmasked?.({ logical: field.value }) ?? field.value ?? '');
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
    accessibilityLabel: label,
    ...inputProps, // by preset
    ...p, // defined props will overwrite above but not below
    onChangeText,
    onBlur,
    maxLength,
    mask,
  };

  return <Component {...commonProps}/>;
}


export type TextInputProps<T extends Control = Control> = TextInputUncontrolledProps | TextInputControlledProps<T>;

/**
 * `label`, a text that will show up identifying the TextInput, defaults to `idToLabel?.[id]`, and then to `id`.
 *
 * `accessibilityLabel` defaults to `label`, as it's useful for unit tests.
 */
export function TextInput<T extends Control = Control>(p: TextInputProps<T>): JSX.Element {
  return isControlled(p)
    ? <TextInputControlled {...p}/>
    : <TextInputUncontrolled {...p}/>;
}