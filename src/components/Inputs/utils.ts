/** react-hook-form's Control type would make some components throw errors. Simplified type. */
export type Control = {'_defaultValues': any};

type ControlledProps = {control: Control};

export function isControlled<T extends ControlledProps>(a: any): a is T {
  return !!(a as T).control;
}