import type { FlexAlignType, StyleProp, ViewProps as RnViewProps, ViewStyle } from 'react-native';
import { StyleSheet, View as RnView } from 'react-native';



export type GevViewProps = {
  /** Alias to `style` */
  s?: StyleProp<ViewStyle>;
  /** Shortcut to `style: { flexDirection: 'row' }`. */
  row?: boolean;
  /** If shall use 'row-reverse' / 'column-reverse' instead of 'row' / 'column'. */
  reverse?: boolean;
  /** Shortcut to `style: { justifyContent: X }`. */
  justify?: ViewStyle['justifyContent'];
  /** Shortcut to `style: { alignItems: X }`. `'center'` if true. */
  align?: true | FlexAlignType;
  /** Shortcut to `style: { justifyContent: 'center', alignItems: 'center' }`. */
  center?: boolean;
  /** Shortcut to `style: { flex: X }`. `1` if true. */
  flex?: true | number;
  /** Shortcut to `style: { flexShrink: X }`. `1` if true. */
  shrink?: true | number;
  /** Shortcut to `style: { flexGrow: X }`. `1` if true. */
  grow?: true | number;
  /** Shortcut to `style: { marginTop: X }`. */
  marginTop?: number | string;
};

export interface ViewProps extends RnViewProps, GevViewProps {}

/** ViewProps with some problematic props like hitSlop omitted. Pressable hitSlop type def is different. */
type MergeViewStylesProps = Omit<ViewProps, 'hitSlop'>;


export function mergeViewStyles({
  row, reverse, justify, align, center, s, style,
  flex, grow, shrink, marginTop,
}: MergeViewStylesProps): StyleProp<ViewStyle> {
  return [style, s, {
    ...flex !== undefined && { flex: flex === true ? 1 : flex },
    ...grow !== undefined && { flexGrow: grow === true ? 1 : grow },
    ...shrink !== undefined && { flexShrink: shrink === true ? 1 : shrink },
    ...justify && { justifyContent: justify },
    ...align && { alignItems: align === true ? 'center' : align },
    ...center && styles.center,
    ...marginTop !== undefined && { marginTop },
    // TODO Explain that if we have 'row' in `s`, having `reverse` will use `column`.
    ...(row || reverse) && {
      flexDirection: (row
        ? (reverse ? 'row-reverse' : 'row')
        : (reverse ? 'column-reverse' : 'column')),
    },
  }];
}

/** Wrapper for the View component. It adds the properties:
 *
 * * `s`, alias to `style`.
 * * `row`, shortcut for style: `{flexDirection: 'row'}`.
 * * `reversed`, to concatenate '-reversed' to 'row' or 'column' in flexDirection.
 * * `center`, shortcut to style `style: {justifyContent: 'center', alignItems: 'center'}`.
 * * `justify`, shortcut to `style: {justifyContent: X}`.
 * * `align`, shortcut to `style: {alignItems: X}`. If true, it defaults to `'center'`.
 * * `flex`, shortcut to `style: { flex: X }`. `1` if true.
 * * `grow`, shortcut to `style: { flexGrow: X }`. `1` if true.
 * * `shrink`, shortcut to `style: { flexShrink: X }`. `1` if true.
 * */
export const View: React.FC<ViewProps> = (props) => {
  return (
    <RnView
      {...props}
      style={mergeViewStyles(props)}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});