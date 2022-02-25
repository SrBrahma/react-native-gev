import type { FlexAlignType, StyleProp, ViewProps as RnViewProps, ViewStyle } from 'react-native';
import { View as RnView } from 'react-native';



type JustifyContent = 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

export type ViewProps = RnViewProps & {
  /** Alias to `style` */
  s?: StyleProp<ViewStyle>;
  /** Shortcut to `style: {flexDirection: 'row'}` */
  row?: boolean;
  /** If shall use 'row-reverse' / 'column-reverse' instead of 'row' / 'column' */
  reverse?: boolean;
  /** Shortcut to `style: {justifyContent: X}` */
  justify?: JustifyContent;
  /** Shortcut to `style: {alignItems: X}` */
  align?: FlexAlignType;
  /** Centers children in main and cross axis.
   *
   * Shortcut to style `style: {justifyContent: 'center', alignItems: 'center'}` */
  center?: boolean;
};


/** Simple wrapper for View component. It adds the properties:
 *
 * * `s`, alias to `style`
 * * `row`, shortcut for style: `{flexDirection: 'row'}`
 * * `reversed`, to concatenate '-reversed' to 'row' or 'column' in flexDirection.
 * * `center`, shortcut to style `style: {justifyContent: 'center', alignItems: 'center'}`
 * * `justify`, shortcut to `style: {justifyContent: X}`
 * * `align`, shortcut to `style: {alignItems: X}`
*/
export const View: React.FC<ViewProps> = ({
  children, reverse,
  style, s, row,
  justify, align, center,
  ...rest
}) => {

  return (
    <RnView
      {...rest}
      style={[{
        flexDirection: (row
          ? (reverse ? 'row-reverse' : 'row')
          : (reverse ? 'column-reverse' : 'column')),
        justifyContent: justify,
        alignItems: align,
        ...center && { justifyContent: 'center', alignItems: 'center' },
      }, s, style]}
    >
      {children}
    </RnView>
  );
};