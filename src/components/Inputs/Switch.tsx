import { useEffect, useRef, useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { SwitchProps as RNSwitchProps } from 'react-native';
import { Switch as RNSwitch } from 'react-native';
import { isControlled } from './utils';



type Common = RNSwitchProps & {
  size?: 'normal' | 'small';
  /** Time in ms that the displayed state will be kept before returning to the `value` property after `onValueChange` is called.
   *
   * This is useful as sometimes your `value` state takes a few renders to be applied.
   *
   * On value change the temporary value is discarded and the timeout is clean.
   *
   * Only used in Uncontrolled component.
   *
   * @default 200 */
  debounceMs?: number;
  /** Shortcut to `containerStyle: { marginTop: X }`. */
  marginTop?: number | string;
};

export type SwitchControlledProps<F extends FieldValues = FieldValues> = Common & {
  /** Not required if not using inside a react-hook-form's form. */
  control: Control<F, any>;
  /** Not required if not using inside a react-hook-form's form. */
  id: FieldPath<F>;
};

export type SwitchUncontrolledProps = Common;

export type SwitchProps<F extends FieldValues = FieldValues> = SwitchControlledProps<F> | SwitchUncontrolledProps;


const sizes = {
  small: 1,
  normal: 1.25,
};

const hitSlop = { bottom: 20, left: 20, right: 20, top: 20 };

function ControlledSwitch<F extends FieldValues = FieldValues>(p: SwitchControlledProps<F>) {
  const { control, id, ...rest } = p;
  const { field } = useController({
    name: id,
    control: control as any,
  });
  return <RNSwitch hitSlop={hitSlop} {...rest} onValueChange={field.onChange} value={field.value}/>;
}


function UncontrolledSwitch({ debounceMs = 200, ...p }: SwitchUncontrolledProps) {
  const [tempValue, setTempValue] = useState<boolean | null>(null);

  const value = tempValue ?? p.value;

  useEffect(() => {
    setTempValue(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.value]);

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  // useCallback would mess the value, wouldn't update.
  const onValueChange = async (value: boolean) => {
    if (p.onValueChange) {
      // We do this as we may have a unstable value due to rendering timing.
      try {
        setTempValue(value);
        await p.onValueChange(value);
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
        timeout.current = setTimeout(() => {
          if (isMounted.current)
            setTempValue(null);
          timeout.current = null;
        }, debounceMs);
      } catch (err) {
        if (isMounted.current)
          setTempValue(null);
      }
    }
  };

  return <RNSwitch
    hitSlop={hitSlop}
    value={value}
    {...p}
    style={[{ marginTop: p.marginTop }, p.style]}
    onValueChange={p.onValueChange ? onValueChange : undefined}
  />;
}

export function Switch<F extends FieldValues = FieldValues>({
  size = 'normal',
  ...p
}: SwitchProps<F>): JSX.Element {
  const style = [{ transform: [{ scale: sizes[size] }] }, p.style];

  return isControlled(p)
    ? <ControlledSwitch {...p} style={style}/>
    : <UncontrolledSwitch {...p} style={style}/>;
}




// TODO: iOS?
// function defaultSwitchProps(value: boolean, disabled: boolean): Partial<SwitchProps> {
//   disabled = false; // won't have different colors for now, couldn't make it good.
//   return {
//     thumbColor: !disabled // front color
//       ? (!value ? 'hsl(120, 0%, 95%)' : 'hsl(120, 30%, 55%)')
//       : (!value ? 'hsla(120, 0%, 95%, 0.8)' : 'hsla(120, 30%, 55%, 0.5)'),
//     trackColor: !disabled // back color
//       ? {
//         false: 'hsl(120, 5%, 70%)',
//         true: 'hsl(120, 50%, 88%)',
//       } : {
//         false: 'hsla(120, 5%, 70%, 0.3)',
//         true: 'hsla(120, 50%, 88%, 0.3)',
//       },
//   };
// }
