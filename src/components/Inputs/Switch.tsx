import { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import type { SwitchProps as RNSwitchProps } from 'react-native';
import { Switch as RNSwitch } from 'react-native';
import is from '@sindresorhus/is';
import type { Control, ControlIds } from './utils';
import { isControlled } from './utils';



type Common = RNSwitchProps & {
  size?: 'normal' | 'small';
};

export type SwitchControlledProps<C extends Control> = Common & {
  /** Not required if not using inside a react-hook-form's form. */
  control: C;
  /** Not required if not using inside a react-hook-form's form. */
  id: ControlIds<C>;
};

export type SwitchUncontrolledProps = Common;

export type SwitchProps<T extends Control = Control> = SwitchControlledProps<T> | SwitchUncontrolledProps;


const sizes = {
  small: 1,
  normal: 1.25,
};

const hitSlop = { bottom: 20, left: 20, right: 20, top: 20 };

function ControlledSwitch<T extends Control>(p: SwitchControlledProps<T>) {
  const { control, id } = p;
  const { field } = useController({
    name: id,
    control: control as any,
  });
  return <RNSwitch hitSlop={hitSlop} {...p} onValueChange={field.onChange} value={field.value}/>;
}

function UncontrolledSwitch(p: RNSwitchProps) {
  const [tempValue, setTempValue] = useState<boolean | null>(null);

  const value = tempValue ?? p.value;

  useEffect(() => {
    setTempValue(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.value]);

  // useCallback would mess the value, wouldn't update.
  const onValueChange = async (value: boolean) => {
    if (p.onValueChange) {
      try {
        const rtn = p.onValueChange(value);
        if (is.promise(rtn)) {
          setTempValue(value);
          await rtn;
        }
      } finally {
        // Always resetting tempValue. Dev is responsible to change the switch value by himself.
        setTempValue(null);
      }
    }
  };

  return <RNSwitch
    hitSlop={hitSlop} {...p} value={value}
    onValueChange={p.onValueChange ? onValueChange : undefined}
  />;
}

export function Switch<T extends Control = Control>({
  size = 'normal',
  ...p
}: SwitchProps<T>): JSX.Element {
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
