import { Validate } from 'react-hook-form';
import { TextInputProps as RnTextInputProps } from 'react-native';
import { cpf } from 'cpf-cnpj-validator';



type Validation = ((v: any) => true | string | undefined);
type Validations = Record<string, Validation>;

/** May be a function, where the param is the current value and it must return its mask. */
export type Mask = string | ((p: {unmasked: string}) => string);


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



export type PresetIds =
  'name'
  | 'email'
  | 'password'
  | 'country.br.cpf'
  | 'mm/yy';




export type TextInputPreset = {
  minLength?: number;
  maxLength?: number;
  mask?: Mask;
  inputProps?: Partial<RnTextInputProps>;
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
export function getPresetInfo(preset: PresetIds | undefined): TextInputPreset {
  if (!preset)
    return {};

  const presets: Record<PresetIds, TextInputPreset> = {
    'name': {
      inputProps: {
        textContentType: 'name',
        autoCompleteType: 'name', // Beware that in RN ~ >0.66 it's renamed to autoComplete. We're still in .64 in Expo.
      },
    },
    'password': {
      inputProps: {
        secureTextEntry: true,
      },
    },
    'email': {
      inputProps: {
        textContentType: 'emailAddress',
        autoCompleteType: 'email',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        caretHidden: false, // For some reason without defining this, the caret wasn't being shown
      },
    },
    // Move this to a separate dir and require specific import. same for cc presets.
    // https://pt.stackoverflow.com/q/94956
    'country.br.cpf': {
      mask: '999.999.999-99',
      inputProps: {
        keyboardType: 'numeric',
      },
      validations: {
        validCpf: (v: string) => { if (!cpf.isValid(v)) return 'Valor inválido'; },
      },
    },
    'mm/yy': {
      mask: '99/99',
      validations: { 'mm/yy': (v: string) => (v.length === 4 && Number(v.slice(0, 2)) < 13) || 'Data inválida' },
      inputProps: { keyboardType: 'numeric' },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return presets[preset] ?? {}; // just to be sure
}
