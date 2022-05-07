import type { Ref } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { StyleProp, TextInput as RnTextInput, TextStyle, ViewStyle } from 'react-native';
import type { PartialBy } from '../../../main';
import type { RequiredBy } from '../../../utils/types';
import type { Control } from '../utils';
import { isControlled } from '../utils';
import type { PresetIds, TextInputPreset, Validations } from './presets/presets';
import { getPreset } from './presets/presets';
import type { MaskedTextInputProps } from './MaskedTextInput';
import { TextInputFormal } from './TextInputFormal';
import { TextInputOutline } from './TextInputOutline';



type TextInputStyles = {
  /** The style of the view that contains everything. */
  containerStyle?: StyleProp<ViewStyle>;
  /** The style of the view that contains the TextInput and rightComponent. Set here the color and radius! */
  contentStyle?: StyleProp<ViewStyle>;
  /** Label's style */
  labelStyle?: StyleProp<TextStyle>;
  /** Sublabel's style */
  sublabelStyle?: StyleProp<TextStyle>;
  /** Error style */
  errorStyle?: StyleProp<TextStyle>;
  /** TextInput's style */
  style?: StyleProp<TextStyle>;
};

/** The TextInput components are given this. */
export interface CommonTextInputProps extends Partial<MaskedTextInputProps>, TextInputStyles {
  /** User-readable name of this input. */
  label?: string;
  /** User-readable additional description of this input. Below label. */
  sublabel?: string;
  error?: string;
  // errorMode?: 'pad' | 'hideShow'
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


export interface TextInputUncontrolledProps extends CommonTextInputProps {
  Component: (p: CommonTextInputProps) => (JSX.Element | null);
}

/** If a function, it's run as a React Hook. */

function TextInputUncontrolled({ Component, ...props }: TextInputUncontrolledProps): JSX.Element {
  const commonProps: CommonTextInputProps = {
    accessibilityLabel: props.label,
    ...props,
  };

  return <Component {...commonProps}/>;
}

export type TextInputControlledProps<F extends FieldValues = FieldValues> =
  Omit<TextInputUncontrolledProps & {
    control: Control<F>;
    /** How you will get it with react-hook-form */
    id: FieldPath<F>;
    /** An object that relates the `id` prop to the `label` prop for this TextInput. */
    idToLabel?: Record<FieldPath<F>, string | undefined>; // Maybe make it Partial instead of | undefined?
    /** @default false */
    required?: boolean;
    preset?: PresetIds | TextInputPreset;
    validations?: Validations;
  }, 'defaultValue'>; /** defaultValue unused as we at most use hook-form defaultValues. It sets the field value. */
export function TextInputControlled<F extends FieldValues = FieldValues>(props: TextInputControlledProps<F>): JSX.Element {
  const {
    id,
    control,
    required = false,
    preset,
    idToLabel,
    label: labelProp,
    Component,
    onChangeText: onChangeProp,
    validations: validationsProp,
    ...p
  } = props;

  if (!id) throw new Error('id prop not set for controlled TextInput!');

  const label = labelProp ?? (idToLabel ? (idToLabel[id] ?? id) : undefined);


  const {
    maxLength, minLength,
    mask, validations, inputProps,
    textToLogical, logicalToUnmasked,
  } = useMemo(() => {
    const overwriters = {
      maxLength: p.maxLength,
      mask: p.mask,
    };
    return {
      ...(typeof preset === 'string' ? getPreset(preset) : preset),
      ...(JSON.parse(JSON.stringify(overwriters)) as Partial<typeof overwriters>),
    };
  }, [p.mask, p.maxLength, preset]);

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
    return unmasked;
    // return prettifyUnmasked?.({ unmasked }) ?? unmasked;
  });

  const onBlur = useCallback((): void => {
    // if (prettifyUnmasked && !fieldState.error)
    //   setUnmasked(prettifyUnmasked({ unmasked: unmasked }) ?? unmasked);
    field.onBlur();
  }, [field]);

  const onChangeText = useCallback((masked: string, unmasked: string) => {
    const logicalValue: string | number = textToLogical?.({ masked, unmasked }) ?? unmasked;
    field.onChange(logicalValue);
    setUnmasked(unmasked);
    onChangeProp?.(masked, unmasked);
  }, [field, onChangeProp, textToLogical]);

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



type TextInputBoth<F extends FieldValues = FieldValues> = (
  PartialBy<TextInputControlledProps<F>, 'Component'> |
  PartialBy<TextInputUncontrolledProps, 'Component'>
);
// We would have errors on useForm is we used PartialBy around all.
export type TextInputProps<F extends FieldValues = FieldValues> = TextInputBoth<F> & {
  type?: TextInputType;
  typesStyles?: Partial<Record<TextInputType, TextInputStyles>>;
};

const componentsDict: Record<TextInputType, (p: CommonTextInputProps) => JSX.Element | null> = {
  formal: TextInputFormal,
  outline: TextInputOutline,
};

/**
 * `label`, a text that will show up identifying the TextInput, defaults to `idToLabel?.[id]`.
 *
 * `accessibilityLabel` defaults to `label`, as it's useful for unit tests.
 */
export function TextInput<F extends FieldValues = FieldValues>(p: TextInputProps<F>): JSX.Element {
  const type = p.type ?? 'formal';
  const Component = p.Component ?? componentsDict[type];

  const styles = p.typesStyles?.[type];

  const errorStyle = useMemo(() => [styles?.errorStyle, p.errorStyle], [p.errorStyle, styles?.errorStyle]);
  const containerStyle = useMemo(() => [styles?.containerStyle, p.containerStyle], [p.containerStyle, styles?.containerStyle]);
  const contentStyle = useMemo(() => [styles?.contentStyle, p.contentStyle], [p.contentStyle, styles?.contentStyle]);
  const labelStyle = useMemo(() => [styles?.labelStyle, p.labelStyle], [p.labelStyle, styles?.labelStyle]);
  const sublabelStyle = useMemo(() => [styles?.sublabelStyle, p.sublabelStyle], [p.sublabelStyle, styles?.sublabelStyle]);
  const style = useMemo(() => [styles?.style, p.style], [p.style, styles?.style]);

  const p2: RequiredBy<TextInputProps<F>, 'Component'> = {
    type,
    numberOfLines: 1,
    ...p,
    errorStyle,
    containerStyle,
    contentStyle,
    labelStyle,
    sublabelStyle,
    style,
    Component,
  };
  return isControlled(p2)
    ? <TextInputControlled {...p2}/>
    : <TextInputUncontrolled {...p2}/>;
}

// id test:
// const A = () => {
//   const {components: {TextInput}} = useForm<{a: number, b: string}>()
//   return <TextInput id='b'/>
// }
