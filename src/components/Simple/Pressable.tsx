import { useMemo } from 'react';
import type { PressableProps as RnPressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable as RnPressable, StyleSheet } from 'react-native';
import { colord } from 'colord';
import type { GevViewProps } from './View';
import { mergeViewStyles } from './View';



export interface PressableProps extends RnPressableProps, GevViewProps {
  /**
   * @default 'ripple'
   * */
  feedback?: 'none' | 'ripple';
  style?: StyleProp<ViewStyle>; // Remove the function type from style
}

// TODO add onPress mLoading wrapper?
/** Wrapper for Pressable.
 * * Has all of our `View` properties.
 * * Automatic ripple color based on style.backgroundColor. The automatic ripple is only applied when onPress is defined. */
export const Pressable: React.FC<PressableProps> = ({
  feedback = 'ripple', ...props
}) => {

  const { mergedStyle, rippleColor } = useMemo(() => {
    const mergedStyle = StyleSheet.flatten(mergeViewStyles(props));
    /** I like a light ripple even on light buttons, but there is a point where it can't be anymore noticeable, so we must use a dark ripple!
     * https://github.com/omgovich/colord/issues/89 */
    const rippleColor = colord(mergedStyle.backgroundColor ?? '#000' as any).brightness() > 0.8 ? '#00000010' : '#ffffff20';
    return {
      mergedStyle,
      rippleColor,
    };
  }, [props]);

  return (
    <RnPressable
      {...props}
      android_ripple={feedback === 'ripple' ? {
        // Only apply automatic ripple when onPress is defined.
        // We use 'transparent' instead of undefined as unsetting the color
        // also removes the pressable background for some weird reason.
        color: props.onPress ? rippleColor : 'transparent',
        ...props.android_ripple,
      } : {
        color: 'transparent', // prob not needed here. rework this.
      }}
      style={mergedStyle}
    />
  );
};