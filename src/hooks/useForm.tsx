import { useMemo } from 'react';
import type { FieldError, FieldValues, UseFormHandleSubmit, UseFormProps as UseFormPropsInternal, UseFormReturn as UseFormReturnInternal } from 'react-hook-form';
import { useForm as useFormInternal } from 'react-hook-form';
import {} from 'react-native';
import type { SwitchControlledProps } from '../components/Inputs/Switch';
import type { TextInputProps } from '../components/Inputs/TextInput/TextInput';
import { TextInput } from '../components/Inputs/TextInput/TextInput';
import { mSnackbar } from '../components/PortalsAndModals/mSnackbar';
import { getErrorMessage, Switch } from '../main';


/** Remove control props from the controlled components as we will automatically fill them. */
type OmitControl<T> = Omit<T, 'control'>;

type Components<F extends FieldValues = FieldValues> = {
  TextInput: (p: OmitControl<TextInputProps<F>>) => JSX.Element;
  Switch: (p: OmitControl<SwitchControlledProps<F>>) => JSX.Element;
};

type UseFormReturn<F extends FieldValues = FieldValues, C = any> = UseFormReturnInternal<F, C> & {
  components: Components<F>;
  // TODO add mention to `onSubmitError`
  /** Same as `handleSubmit(valid, invalid)`, but:
   *
   * * Uncaught errors on `valid` creates a Snackbar with the error message.
   * * Invalid form values creates a Snackbar with the field's `label` and its error message.
   * - - `invalid` is still called after the Snackbar is created.
   * - - If `label` is undefined, fallbacks to `id`.
   * - - `idToLabel` property on `useForm` may be used to define the `label` automatically.
   */
 // TODO add other errors displays besides Snackbar, as Alert/mError.
 smartHandleSubmit: UseFormHandleSubmit<F>;
};


type UseFormProps<F extends FieldValues = FieldValues, C = any> = UseFormPropsInternal<F, C> & {
  idToLabel?: Record<keyof F, string>;
  /** How to report the error to the user when the submit is called, either being it a form error
   * of uncaught error on the submit function.
   *
   * @default 'snackbar' */
  onSubmitError?: 'snackbar';
};

/** Improves the useForm:
 * * Defaults `mode` to `'onTouched'`.
 * * Has a `smartHandleSubmit`, that automatically creates a Snackbar on errors.
 * * Returns inputs components with `control` prop populated
 * * Returns inputs components with `idToLabel` prop populated, if defined
 */
export function useForm<F extends FieldValues = FieldValues, C = any>(props?: UseFormProps<F, C>): UseFormReturn<F, C> {
  const {
    idToLabel,
    onSubmitError = 'snackbar',
    ...rest
  } = props ?? {};
  const useFormReturn = useFormInternal<F, C>({ mode: 'onTouched', ...rest });
  // Without this memo, the inputs/the form would lose their values on parent state change / render.
  return useMemo(() => {
    const onError = (message: string) => {
      mSnackbar({ text: message });
    };

    const { control, handleSubmit } = useFormReturn;

    const smartHandleSubmit: UseFormHandleSubmit<F> = (valid, invalid) => handleSubmit(async (e) => {
      try {
        await valid(e);
      } catch (err) {
        onError(getErrorMessage(err));
      }
    }, (e) => {
      const error = Object.entries(e)[0]! as [id: keyof F, error: FieldError];
      const label = idToLabel?.[error[0]] ?? error[0];
      const message = `${label} - ${error[1].message}`;
      switch (onSubmitError) {
        case 'snackbar':
          mSnackbar({ text: message });
      }
      invalid?.(e);
    });

    const components: Components<F> = {
      TextInput(p) { return <TextInput control={control} idToLabel={idToLabel} {...p}/>; },
      Switch(p) { return <Switch control={control} {...p}/>; },
    };

    return {
      ...useFormReturn,
      components,
      smartHandleSubmit,
    };

  }, [idToLabel, onSubmitError, useFormReturn]);
}