import { useMemo } from 'react';
import type { Control, FieldValues, UseFormProps as UseFormPropsInternal, UseFormReturn as UseFormReturnInternal } from 'react-hook-form';
import { useForm as useFormInternal } from 'react-hook-form';
import {} from 'react-native';
import type { SwitchControlledProps } from '../components/Inputs/Switch';
import type { TextInputControlledProps } from '../components/Inputs/TextInput/TextInput';
import { TextInput } from '../components/Inputs/TextInput/TextInput';
import { Switch } from '../main';


/** Remove control props from the controlled components as we will automatically fill them. */
type OmitControl<T> = Omit<T, 'control'>;

type Components<F extends FieldValues = FieldValues, C extends object = object> = {
  TextInput: (p: OmitControl<TextInputControlledProps<Control<F, C>>>) => JSX.Element;
  Switch: (p: OmitControl<SwitchControlledProps<Control<F, C>>>) => JSX.Element;
};

type UseFormReturn<F extends FieldValues = FieldValues, C extends object = object> = {
  components: Components<F, C>;
  /** Same as handleSubmit, but on invalid values, creates a Snackbar with the field's `label` and its error message.
   *
   * If `label` is undefined, fallbacks to `id`.
   *
   * `idToLabel` may be used to define the `label` automatically.
  */
  // improvedHandleSubmit: UseFormHandleSubmit<F>;
} & UseFormReturnInternal<F, C>;


type UseFormProps<F extends FieldValues = FieldValues, C extends object = object> = UseFormPropsInternal<F, C> & {
  idToLabel?: Record<keyof F, string>;
};

/** Improves the useForm:
 * * Defaults `mode` to `'onTouched'`.
 * * Has a improvedHandleSubmit, which automatically creates a Snackbar on error.
 * * Returns inputs components with `control` prop populated
 * * Returns inputs components with `idToLabel` prop populated, if defined
 */
export function useForm<F extends FieldValues = FieldValues, C extends object = object>(props?: UseFormProps<F, C>): UseFormReturn<F, C> {
  const { idToLabel, ...rest } = props ?? {};
  const useFormReturn = useFormInternal({ mode: 'onTouched', ...rest });
  // Without this memo, the inputs/the form would lose their values on parent state change / render.
  return useMemo(() => {
    const { control } = useFormReturn;
    // const improvedHandleSubmit: UseFormHandleSubmit<F> = (valid, invalid) => handleSubmit(valid, (e) => {
    //   const error = Object.entries(e)[0]! as [id: keyof F, error: FieldError];
    //   const label = idToLabel?.[error[0]] ?? error[0];
    //   const message = `${label} - ${error[1].message}`;
    //   snackbar(message);
    //   invalid?.(e);
    // });
    const components: Components<F, C> = {
      TextInput: function (p) { return <TextInput control={control} idToLabel={idToLabel} {...p}/>; },
      Switch: function (p) { return <Switch control={control} {...p}/>; },
    };
    return {
      ...useFormReturn,
      components,
      // improvedHandleSubmit,
    };
  }, [idToLabel, useFormReturn]);
}