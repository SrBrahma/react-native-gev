import type { PressableProps as RnPressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable as RnPressable, StyleSheet } from 'react-native';
import { colord } from 'colord';
import type { NewViewProps } from '../Views/View';
import { mergeViewStyles } from '../Views/View';



export interface PressableProps extends RnPressableProps, NewViewProps {
  style?: StyleProp<ViewStyle>; // Remove the function type from style
}

// TODO add onPress mLoading wrapper?
/** Wrapper for Pressable.
 * * Has all of our `View` properties.
 * * Automatic ripple color based on style.backgroundColor. */
export const Pressable: React.FC<PressableProps> = ({
  reverse,
  style, s, row,
  justify, align, center,
  ...rest
}) => {

  const mergedStyle = StyleSheet.flatten(mergeViewStyles({ row, reverse, justify, align, center, s, style }));
  const rippleColor = colord(mergedStyle.backgroundColor ?? '#000' as any).brightness() > 0.8 ? '#00000014' : '#ffffff2f';

  return (
    <RnPressable
      {...rest}
      android_ripple={{
        color: rippleColor,
        ...rest.android_ripple,
      }}
      style={mergedStyle}
    />
  );
};