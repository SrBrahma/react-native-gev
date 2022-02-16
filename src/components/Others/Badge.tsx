// Based on https://github.com/callstack/react-native-paper/blob/main/src/components/Badge.tsx

import { useEffect, useRef } from 'react';
import type { ColorValue, StyleProp, TextStyle } from 'react-native';
import { Animated, StyleSheet } from 'react-native';
import color from 'color';
import { useTheme } from '../../main';



export default function getContrastingColor(input: ColorValue, light: string, dark: string): string {
  if (typeof input === 'string')
    return color(input).isLight() ? dark : light;
  return light;
}

const defaultSize = 20;

export type BadgeProps = {
  /** Content of the `Badge`. Won't show up only if undefined. */
  value?: true | string | number;
  /** Size of the `Badge`.
   * @default 20 */
  size?: number;
  textStyle?: StyleProp<TextStyle>;
};


/**
 * Badges are small status descriptors for UI elements.
 * A badge consists of a small circle, typically containing a number or other short set of characters, that appears in proximity to another object.
 *
 * <div class="screenshots">
 *   <figure>
 *     <img class="small" src="screenshots/badge-1.png" />
 *     <figcaption>Badge with content</figcaption>
 *   </figure>
 *   <figure>
 *     <img class="small" src="screenshots/badge-2.png" />
 *     <figcaption>Badge without content</figcaption>
 *   </figure>
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Badge } from 'react-native-paper';
 *
 * const MyComponent = () => (
 *   <Badge>3</Badge>
 * );
 *
 * export default MyComponent;
 * ```
 */
export function Badge({
  value,
  size = defaultSize,
  textStyle,
  ...rest
}: BadgeProps): JSX.Element {
  const visible = value !== undefined;
  const { current: opacity } = useRef(new Animated.Value(visible ? 1 : 0));
  const isFirstRender = useRef(true);
  const theme = useTheme();

  useEffect(() => {
    // Do not run animation on very first rendering
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);


  const { backgroundColor = theme.colors.badge, ...restStyle } = StyleSheet.flatten(textStyle ?? {});
  const textColor = getContrastingColor(backgroundColor, '#fff', '#000');
  const borderRadius = size / 2;

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        {
          opacity,
          backgroundColor,
          color: textColor,
          fontSize: size * 0.5,
          ...theme.fonts.regular,
          lineHeight: size,
          height: size,
          minWidth: size,
          borderRadius,
        },
        s.text,
        restStyle,
      ]}
      {...rest}
      children={value}
    />
  );
}


const s = StyleSheet.create({
  text: {
    alignSelf: 'flex-end',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
});