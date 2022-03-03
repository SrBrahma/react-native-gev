import type { FlexAlignType, StyleProp, ViewProps as RnViewProps, ViewStyle } from 'react-native';
import { View as RnView } from 'react-native';



type JustifyContent = 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | undefined;


export type NewViewProps = {
  /** Alias to `style` */
  s?: StyleProp<ViewStyle>;
  /** Shortcut to `style: {flexDirection: 'row'}` */
  row?: boolean;
  /** If shall use 'row-reverse' / 'column-reverse' instead of 'row' / 'column' */
  reverse?: boolean;
  /** Shortcut to `style: {justifyContent: X}` */
  justify?: JustifyContent;
  /** Shortcut to `style: {alignItems: X}`.
   *
   * If **true**, defaults to `'center'`. */
  align?: true | FlexAlignType;
  /** Centers children in main and cross axis.
   *
   * Shortcut to style `style: {justifyContent: 'center', alignItems: 'center'}` */
  center?: boolean;
};

export interface ViewProps extends RnViewProps, NewViewProps {}


export function mergeViewStyles({ row, reverse, justify, align: alignProp, center, s, style }: ViewProps): StyleProp<ViewStyle> {
  const align = alignProp === true ? 'center' : alignProp;

  return [{
    flexDirection: (row
      ? (reverse ? 'row-reverse' : 'row')
      : (reverse ? 'column-reverse' : 'column')),
    justifyContent: justify,
    alignItems: align,
    ...center && { justifyContent: 'center', alignItems: 'center' },
  }, s, style];
}

/** Simple wrapper for View component. It adds the properties:
 *
 * * `s`, alias to `style`
 * * `row`, shortcut for style: `{flexDirection: 'row'}`
 * * `reversed`, to concatenate '-reversed' to 'row' or 'column' in flexDirection.
 * * `center`, shortcut to style `style: {justifyContent: 'center', alignItems: 'center'}`
 * * `justify`, shortcut to `style: {justifyContent: X}`
 * * `align`, shortcut to `style: {alignItems: X}`. If true, it defaults to `'center'`.
 * * `onPress`, to use a Pressable instead of a View!
 * */
export const View: React.FC<ViewProps> = ({
  reverse,
  style, s, row,
  justify, align, center,
  ...rest
}) => {

  return (
    <RnView
      {...rest}
      style={mergeViewStyles({ row, reverse, justify, align, center, s, style })}
    />
  );
};