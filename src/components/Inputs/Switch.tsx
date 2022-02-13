import { useEffect, useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';
import is from '@sindresorhus/is';



type Common = RNSwitchProps & {
  size?: 'normal' | 'small';
};

type Controlled<T extends Control<any, object>> = Common & {
  control: T;
  /** How you will get it with react-hook-form */
  id: (keyof T['_defaultValues']) & string;
  /** May already have been defined at useForm. */
  defaultValue?: boolean;
};

type Uncontrolled = Common;

export type SwitchProps<T = null> = T extends Control<any, object> ? Controlled<T> : Uncontrolled;



function isControlled<T extends Control<any, object>>(a: any): a is Controlled<T> {
  return !!(a as Controlled<T>).control;
}

const sizes = {
  small: 1,
  normal: 1.25,
};

const hitSlop = { bottom: 20, left: 20, right: 20, top: 20 };

function ControlledSwitch<T extends Control<any, object>>(props: Controlled<T>) {
  const { control, defaultValue, id } = props;
  const { field } = useController({
    name: id,
    control,
    defaultValue: defaultValue as any, // idk why as any.
  });
  return <RNSwitch hitSlop={hitSlop} {...props} onValueChange={field.onChange} value={field.value}/>;
}

function UncontrolledSwitch(props: RNSwitchProps) {
  const [tempValue, setTempValue] = useState<boolean | null>(null);

  const value = tempValue ?? props.value;

  useEffect(() => {
    setTempValue(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  // useCallback would mess the value, wouldn't update.
  const onValueChange = async (value: boolean) => {
    if (props.onValueChange) {
      try {
        const rtn = props.onValueChange(value);
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
    hitSlop={hitSlop} {...props} value={value}
    onValueChange={props.onValueChange ? onValueChange : undefined}
  />;
}

export function Switch<T>({
  size = 'normal',
  ...props
}: SwitchProps<T>): JSX.Element {
  const style = [{ transform: [{ scale: sizes[size] }] }, props.style];

  return isControlled(props)
    ? <ControlledSwitch {...props} style={style}/>
    : <UncontrolledSwitch {...props} style={style}/>;
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
