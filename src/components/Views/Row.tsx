import type { ViewProps } from 'react-native';
import { View } from 'react-native';



export type RowProps = ViewProps & JustifyContent & {
  /** If shall use 'row-reverse' instead of 'row' */
  reverse?: boolean;
};

type JustifyContent = {
  /** Shortcut for justifyContent: 'center' */
  center?: boolean;
  /** Shortcut for justifyContent: 'flex-start' */
  flexStart?: boolean;
  /** Shortcut for justifyContent: 'flex-end' */
  flexEnd?: boolean;
  /** Shortcut for justifyContent: 'space-around' */
  spaceAround?: boolean;
  /** Shortcut for justifyContent: 'space-between' */
  spaceBetween?: boolean;
  /** Shortcut for justifyContent: 'space-evenly' */
  spaceEvenly?: boolean;
};

type JustifyContentValue = 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

function convertJustify(param: JustifyContent): JustifyContentValue {
  if (param.center)
    return 'center';
  if (param.flexStart)
    return 'flex-start';
  if (param.flexEnd)
    return 'flex-end';
  if (param.spaceAround)
    return 'space-around';
  if (param.spaceBetween)
    return 'space-between';
  if (param.spaceEvenly)
    return 'space-evenly';
}


/** Simply applies `flexDirection: 'row'` or 'row-reverse' to the View's style if `reverse` prop is true. */
export const Row: React.FC<RowProps> = ({
  children, reverse, style,
  center, flexStart, flexEnd, spaceAround, spaceBetween, spaceEvenly,
  ...rest
}) => {
  const justifyContent = convertJustify({ center, flexStart, flexEnd, spaceAround, spaceBetween, spaceEvenly });
  return (
    <View
      {...rest}
      style={[{ flexDirection: reverse ? 'row-reverse' : 'row', justifyContent }, style]}
    >
      {children}
    </View>
  );
};