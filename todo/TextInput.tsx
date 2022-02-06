import { useState } from 'react';
import { Control, useController, Validate } from 'react-hook-form';
import { StyleSheet, TextInputProps as RNTextInputProps, ViewStyle } from 'react-native';
import { integerPriceToString } from '@ahive/shared';
// import ccValidator from 'card-validator';
// TODO add plugin to treeshake add it, as non-br users or even br users who won't use this won't want this by default
// In preset, check if plugin was loaded.
// import { cnpj, cpf } from 'cpf-cnpj-validator';
import { InputOutline, InputOutlineProps } from './InputOutline';

/*
  isX: Changes the return or has special effects
*/

// To be reused inside presets
function makeValidations<T extends Record<string, Validate<any> |((p: any) => Record<string, Validate<any>>)>>(p: T) { return p; }
export const Validations = makeValidations({
  numbersOnly: (v: string) => /^\d*$/.test(v) || 'Número inválido',
  mustBeNotNegative: (v: number) => v >= 0 || 'Deve ser positivo',
  isNumber: (v: number) => !isNaN(v) || 'Número inválido',
  maxDecimalPlaces: (max: number) => ({
    maxDecimalPlaces: (v: number) => (((v.toString().split('.')[1] ?? []).length <= 2) || `>= ${max} casas decimais`),
  }),
});

export type TextInputCoreProps = RNTextInputProps & {
  containerStyle?: ViewStyle;
  /** If should add marginTop.
   *
   * `true` will use a default value, but you may provide a number.
   *
   * @default false */
  marginTop?: number | boolean;
  icon?: JSX.Element;
  // name: Names;
};

type PresetIds =
  'email'
  | 'integerPrice' // Ex 1099 for 10.99
  | 'country.br.cpfCnpj'
  | 'cc.name'
  | 'cc.number'
  /** Credit Card CVV (3-4 numbers) */
  | 'cc.cvv'
  | 'mm/yy';

export type TextInputProps<T extends Control<any, object>> = Omit<InputOutlineProps & {
  /** If will add a basic margin bottom.
   * @default true */
  marginBottom?: boolean;
  control: T;
  /** How you will get it with react-hook-form */
  id: (keyof T['_defaultValues']) & string;
  /** User-readable name of this input. */
  title: string;
  optional?: boolean;
  required?: boolean;
  preset?: PresetIds | TextInputPreset;
  maxLength?: number;
  pretitle?: string;
  /** Min number value. */
  minValue?: number;
  /** Char count is shown if maxLength is defined.
   * @default false */
  hideCharacterCount?: boolean;

}, 'defaultValue'>; /** defaultValue unused as we at most will use hook-form defaultValues. It sets the field value. */

type Validation = ((v: any) => true | string | undefined);
type Validations = Record<string, Validation>;

/** May be a function, where the param is the current value and it must return its mask. */
type Mask = string | ((p: {unmasked: string}) => string);


export type TextInputPreset = {
  minLength?: number;
  maxLength?: number;
  mask?: Mask;
  inputProps?: Partial<InputOutlineProps>;
  validations?: Validations;
  /** Run on init and onBlur.
   *
   * On init, it's first called logicValueToDisplayValue.
   *
   * On blur, it's only called if there are no errors on the input.
   *
   * E.g.: If you have a text price of 01,5, it would return 1.50, for a price preset.
   *
   * If undefined or undefined return, won't change the display value.
   *
   * (Should it return mask or unmasked? Should we call mask on it?) If using a mask, your return should return the masked value to avoid a value change on next render. */
  prettifyUnmasked?: (p: {unmasked: string}) => string | undefined;
  unmaskedToLogical?: (p: {unmasked: string}) => string | number;
  logicalToUnmasked?: (p: {logical: any}) => string;
};

// In InputOutline we get maxLength from mask.length using maskedText.
function getPresetInfo(preset: PresetIds | undefined): TextInputPreset {
  if (!preset)
    return {};

  const presets: Record<PresetIds, TextInputPreset> = {
    'email': {
      inputProps: {
        textContentType: 'emailAddress',
        autoCompleteType: 'email',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
      },
    },
    'integerPrice': {
      inputProps: {
        keyboardType: 'numeric',
        leftText: 'R$', // TODO add i18n support
      },
      validations: {
        ...Validations.mustBeNotNegative,
        ...Validations.isNumber,
        ...Validations.maxDecimalPlaces(2),
      },
      prettifyUnmasked: ({ unmasked }) => {
        const isValidNumeric = (value: string | number) => {
          if (typeof value === 'string')
            value = Number(value.replace(',', '.'));
          return !isNaN(value);
        };

        if (isValidNumeric(unmasked))
          return integerPriceToString(Number(unmasked), { preset: 'BRL', includeSymbol: false });

        // if (isIntegerPrice && displayValue === '') {
        //   return setDisplayValue(prettifyValue(0, { isIntegerPrice }));
        // }
        // if (!fieldState.error)
        //   return setDisplayValue(prettifyValue(field.value, { isIntegerPrice }));
      },
      unmaskedToLogical: ({ unmasked }) => {
        return Number(unmasked.replace(/[,.]/g, ''));
      },

    },
    'cc.number': {
      // Could use type -> gaps from https://www.npmjs.com/package/card-validator we are already using
      mask: '9999 9999 9999 9999 999', inputProps: { keyboardType: 'numeric' },
      validations: {
        validCCNumber: (v: string) => ccValidator.number(v).isValid || 'Cartão inválido',
      },
    },
    'cc.name': {
      // https://www.isignthis.com/knowledge/what-are-the-max-length-characters-for-first-name-and-last-name
      minLength: 2, maxLength: 26,
      // transformations: (v: string) => v.toUpperCase(), fucking android bug duplicating entry https://github.com/facebook/react-native/issues/11068
      inputProps: {
        autoCapitalize: 'characters',
        hideCharacterCount: true,
      },
    },
    // https://pt.stackoverflow.com/q/94956
    'country.br.cpfCnpj': {
      mask: (({ unmasked }) => (unmasked.length <= 11 ? '999.999.999-99' : '99.999.999/9999-99')),
      inputProps: {
        keyboardType: 'numeric',
        hideCharacterCount: true,
      },
      maxLength: 18, // overwrite mask.length as maxLength. allows swapping masks. 18 is cnpj with mask length.
      validations: {
        validCpfCnpj: (v: string) => {
          if (v.length <= 11) {
            if (v.length < 11)
              return 'CPF/CNPJ inválido';
            if (!cpf.isValid(v))
              return 'CPF inválido';
          } else if (v.length !== 14 || !cnpj.isValid(v)) {
            return 'CNPJ inválido';
          }
        },
      },
    },
    'cc.cvv': { mask: '9999', minLength: 3, inputProps: { keyboardType: 'numeric' } },
    'mm/yy': {
      mask: '99/99',
      validations: { 'mm/yy': (v: string) => (v.length === 4 && Number(v.slice(0, 2)) < 13) || 'Data inválida' },
      inputProps: { keyboardType: 'numeric' },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return presets[preset] ?? {}; // just to be sure
}


export function TextInput<T extends Control<any, object>>({
  // marginTop: marginTopArg = true,
  // icon,
  id,
  control,
  // defaultValue = '',
  /** @default true */
  optional: optionalProp = true,
  /** @default false */
  required: requiredProp = false,
  style,
  preset,
  marginBottom = true,
  title,
  // === Validations below:
  minValue,
  ...props
}: Omit<TextInputProps<T>, 'onChangeText'>): JSX.Element {
  if (!id) throw new Error('id not set for TextInput');

  const required = requiredProp || !optionalProp;

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
      validate: {
        // TODO remove this from here somehow. Maybe the presets should allow passing parameters.
        ...minValue !== undefined && { minValue: (v: number) => v >= minValue || `Mínimo é ${minValue}` },
        ...validations,
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
  };


  return <InputOutline
    error={fieldState.error ? String(fieldState.error.message) : undefined}
    activeColor='#ffb130'
    selectionColor='#ffb12090' // The blinking cursor
    value={unmasked}
    style={[s.textInput, marginBottom && { marginBottom: 28 }, style]}
    placeholder={title}
    numberOfLines={1}
    fontSize={18}
    characterCountFontSize={12}
    onBlur={onBlur}

    {...inputProps} // by preset
    {...props} // defined props will overwrite above but not below

    onChangeText={onChangeText}
    maxLength={maxLength}
    mask={typeof mask === 'function' ? mask({ unmasked }) : mask}
  />;
}


const s = StyleSheet.create({
  textInput: {
    textAlignVertical: 'top', // For multiline inputs
    flexGrow: 1, // Required on row formation, like 2 inputs next to each other
  },
});