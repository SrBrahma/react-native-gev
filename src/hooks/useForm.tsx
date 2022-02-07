import { Control, FieldValues, useForm as useFormInternal, UseFormProps, UseFormReturn as UseFormReturnInternal } from 'react-hook-form';
import {} from 'react-native';
import { TextInput, TextInputProps } from '../components/Inputs/TextInput/TextInput';



type OmitControl<T> = Omit<T, 'control'>;

type Components<F extends FieldValues = FieldValues, C extends object = object> = {
  TextInput: (p: OmitControl<TextInputProps<Control<F, C>>>) => JSX.Element;
};

type UseFormReturn<F extends FieldValues = FieldValues, C extends object = object> = {
  components: Components<F, C>;
} & UseFormReturnInternal<F, C>;

/** Wraps the useForm, returning inputs components with `control` prop populated and having mode: 'all' in useForm option. */
export function useForm<F extends FieldValues = FieldValues, C extends object = object>(p?: UseFormProps<F, C>): UseFormReturn<F, C> {
  const useFormReturn = useFormInternal({ ...p, mode: 'all' });
  const { control } = useFormReturn;
  const components: Components<F, C> = {
    TextInput: function (p) { return <TextInput {...p} control={control}/>;},
  };
  return {
    ...useFormReturn,
    components,
  };
}
