import type { Control as OriginalControl, FieldPath, FieldValues } from 'react-hook-form';


/** react-hook-form's Control type would make some components throw errors. Simplified type. */
export type Control<F extends FieldValues = FieldValues> = Pick<OriginalControl<F>, '_formValues'>;
export type ControlIds<C extends Control> = FieldPath<C['_formValues']>;

type ControlledProps = {control: Control};

export function isControlled<T extends ControlledProps>(a: any): a is T {
  return !!(a as T).control;
}