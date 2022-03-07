import type { PressableProps as RnPressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable as RnPressable, StyleSheet } from 'react-native';
import { colord } from 'colord';
import type { NewViewProps } from './View';
import { mergeViewStyles } from './View';



export interface PressableProps extends RnPressableProps, NewViewProps {
  style?: StyleProp<ViewStyle>; // Remove the function type from style
}

// TODO add onPress mLoading wrapper?
/** Wrapper for Pressable.
 * * Has all of our `View` properties.
 * * Automatic ripple color based on style.backgroundColor. */
export const Pressable: React.FC<PressableProps> = (props) => {

  const mergedStyle = StyleSheet.flatten(mergeViewStyles(props));
  const rippleColor = colord(mergedStyle.backgroundColor ?? '#000' as any).brightness() > 0.8 ? '#00000014' : '#ffffff2f';

  return (
    <RnPressable
      {...props}
      android_ripple={{
        color: rippleColor,
        ...props.android_ripple,
      }}
      style={mergedStyle}
    />
  );
};