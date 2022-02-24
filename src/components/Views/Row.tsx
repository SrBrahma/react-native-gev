import type { ViewProps } from 'react-native';
import { View } from 'react-native';



export type RowProps = ViewProps & {
  reverse?: boolean;
};

/** Simply applies `flexDirection: 'row'` or 'row-reverse' to the View's style if `reverse` prop is true. */
export const Row: React.FC<RowProps> = ({ children, reverse, style, ...rest }) => {
  return (
    <View {...rest} style={[{ flexDirection: reverse ? 'row-reverse' : 'row' }, style]}>
      {children}
    </View>
  );
};