import { Control, FieldError, FieldValues, useForm as useFormInternal, UseFormHandleSubmit, UseFormProps as UseFormPropsInternal, UseFormReturn as UseFormReturnInternal } from 'react-hook-form';
import {} from 'react-native';
import { TextInput, TextInputProps } from '../components/Inputs/TextInput/TextInput';
import { M } from '..';



type OmitControl<T> = Omit<T, 'control'>;

type Components<F extends FieldValues = FieldValues, C extends object = object> = {
  TextInput: (p: OmitControl<TextInputProps<Control<F, C>>>) => JSX.Element;
};

type UseFormReturn<F extends FieldValues = FieldValues, C extends object = object> = {
  components: Components<F, C>;
  /** Same as handleSubmit, but on invalid values, creates a Snackbar with the field's `label` and its error message.
   *
   * If `label` is undefined, fallbacks to `id`.
   *
   * `idToLabel` may be used to define the `label` automatically.
  */
  improvedHandleSubmit: UseFormHandleSubmit<F>;
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
  const { control, handleSubmit } = useFormReturn;
  const improvedHandleSubmit: UseFormHandleSubmit<F> = (valid, invalid) => handleSubmit(valid, (e) => {
    const error = Object.entries(e)[0]! as [id: keyof F, error: FieldError];
    const label = idToLabel?.[error[0]] ?? error[0];
    const message = `${label} - ${error[1].message}`;
    M.snackbar(message);
    invalid?.(e);
  });
  const components: Components<F, C> = {
    TextInput: function (props2) { return <TextInput control={control} idToLabel={idToLabel} {...props2}/>;},
  };
  return {
    ...useFormReturn,
    components,
    improvedHandleSubmit,
  };
}
