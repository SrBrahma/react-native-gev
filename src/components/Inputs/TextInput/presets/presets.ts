import type { Validate, ValidateResult } from 'react-hook-form';
import type { ZodSchema } from 'zod';
import { z } from 'zod';
import type { Mask } from '../MaskedTextInput';
import type { CommonTextInputProps } from '../TextInput';



export type Validations = Record<string, Validate<any>>;




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


function parseZod(z: ZodSchema<any>, v: any): ValidateResult {
  const parsed = z.safeParse(v);
  return parsed.success || parsed.error.issues[0]?.message || 'Error';
}


export type PresetIds =
  'name'
  | 'email'
  | 'password'
  | 'mm/yy'
  | 'integerPrice'
  | 'floatPrice';




export type TextInputPreset = {
  minLength?: number;
  maxLength?: number;
  mask?: Mask;
  inputProps?: Partial<CommonTextInputProps>;
  validations?: Validations;
  textToLogical?: (p: {masked: string; unmasked: string}) => string | number;
  logicalToUnmasked?: (p: {logical: any}) => string;
};
const presets: Record<PresetIds, TextInputPreset> = {
  name: {
    inputProps: {
      textContentType: 'name',
      autoCompleteType: 'name', // Beware that in RN ~ >0.66 it's renamed to autoComplete. We're still in .64 in Expo.
    },
  },
  password: {
    inputProps: {
      secureTextEntry: true,
    },
  },
  email: {
    inputProps: {
      textContentType: 'emailAddress',
      autoCompleteType: 'email',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      caretHidden: false, // For some reason without defining this, the caret wasn't being shown
    },
    validations: {
      validEmail: (v: string) => parseZod(z.string().email('Email inválido'), v),
    },
  },
  'mm/yy': {
    mask: '99/99',
    validations: { 'mm/yy': (v: string) => (v.length === 4 && Number(v.slice(0, 2)) < 13) || 'Data inválida' },
    inputProps: { keyboardType: 'numeric' },
  },
  integerPrice: {
    textToLogical: ({ unmasked }) => Number(unmasked),
    inputProps: {
      leftText: 'R$',
      maskType: 'currency', // No need to logicalToUnmasked when using this
      keyboardType: 'decimal-pad',
      options: { precision: 2, groupSeparator: '.', decimalSeparator: ',' },
    },
  },
  floatPrice: {
    textToLogical: ({ unmasked }) => {
      // let value = masked;
      // // Remove groupSeparator
      // value = value.replace(/\./g, '');
      return Number(unmasked) / 100;
    },
    inputProps: {
      leftText: 'R$',
      maskType: 'currency', // No need to logicalToUnmasked when using this
      keyboardType: 'decimal-pad',
      options: { precision: 2, groupSeparator: '.', decimalSeparator: ',' },
    },
  },
};

// In InputOutline we get maxLength from mask.length using maskedText.
export function getPreset(preset: string): TextInputPreset {
  return (presets as Record<string, TextInputPreset>)[preset] ?? {};
}
