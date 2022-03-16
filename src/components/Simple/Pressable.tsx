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
 * * Automatic ripple color based on style.backgroundColor. The automatic ripple is only applied when onPress is defined. */
export const Pressable: React.FC<PressableProps> = (props) => {

  const mergedStyle = StyleSheet.flatten(mergeViewStyles(props));
  const rippleColor = colord(mergedStyle.backgroundColor ?? '#000' as any).brightness() > 0.8 ? '#0000000d' : '#ffffff14';

  return (
    <RnPressable
      {...props}
      android_ripple={{
        // Only apply automatic ripple when onPress is defined.
        // We use 'transparent' instead of undefined as unsetting the color
        // also removes the pressable background for some weird reason.
        color: props.onPress ? rippleColor : 'transparent',
        ...props.android_ripple,
      }}
      style={mergedStyle}
    />
  );
};