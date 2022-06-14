import type { StyleProp, TextProps as RnTextProps, TextStyle } from 'react-native';
import { StyleSheet, Text as RnText } from 'react-native';
import type { OmitKey } from '../../internalUtils/types';
import type { ThemeReturn } from '../../main';
import { useTheme } from '../../main';



export type GevTextProps = {
   /** Shortcut prop instead using children to pass the text. */
   text?: React.ReactNode;
   /** Shortcut prop instead using children to pass the text. Alias to `text` property. */
   t?: React.ReactNode;
   /** Alias to style. */
   s?: StyleProp<TextStyle>;
   /** Besides numberOfLines: 1, will ellipsis and shrink the text if going outside the maximum size. */
   singlelineEllipsis?: boolean;
   /** Shortcut to `style: { textAlign: X }`. `'center'` if true. */
   align?: true | TextStyle['textAlign'];
   /** Shortcut to `style: { textAlignVertical: X }`. `'center'` if true. */
   alignVertical?: true | TextStyle['textAlignVertical'];
   /** Shortcut to `style: { textAlign: 'center', textAlignVertical: 'center' }`. */
   center?: true;
   /** Shortcut to `style: { marginTop: X }`. */
   marginTop?: number | string;
   /** Shortcut to `style: { color: X }`. */
   color?: TextStyle['color'];
};

export type TextProps = RnTextProps & GevTextProps;

type MergeTextStyle = OmitKey<GevTextProps, 't' | 'text'> & {
  theme: ThemeReturn;
  style: StyleProp<TextStyle>;
};
function mergeTextStyle({
  align, alignVertical, center, s, style, singlelineEllipsis, theme, marginTop, color,
}: MergeTextStyle): StyleProp<TextStyle> {
  return [
    {
      includeFontPadding: false,
      ...theme.fonts.regular,
      color: theme.colors.text,
    },
    style,
    s,
    {
      ...align && { textAlign: align === true ? 'center' : align },
      ...alignVertical && { textAlignVertical: alignVertical === true ? 'center' : alignVertical },
      ...center && styles.center,
      ...singlelineEllipsis && styles.shrink,
      ...marginTop !== undefined && { marginTop },
      ...color && { color },
    },
  ];
}

/** Wrapper for the Text component.
 *
 * * `includeFontPadding: false` style by default. When `true`, it is usually bad for vertical centering.
 *
 * And adds the properties:
 *
 * * `text` and `t` to be used instead of children. Smaller code and more readable.
 * * `s`, alias to `style`.
 * * `align`, shortcut to `style: { textAlign: X }`. `'center'` if true.
 * * `alignVertical`, shortcut to `style: { textAlignVertical: X }`. `'center'` if true.
 * * `center`, shortcut to style `style: { textAlign: 'center', textAlignVertical: 'center' }`.
 * * `singlelineEllipsis`, besides numberOfLines: 1, will ellipsis and shrink the text if going outside the maximum size.
 */
export const Text: React.FC<TextProps> = ({
  align, alignVertical, center, style, s, singlelineEllipsis, t, text, children, ...rest

}) => {
  const theme = useTheme();

  return (
    <RnText
      {...singlelineEllipsis && singleLineEllipsisProps}
      {...rest}
      style={mergeTextStyle({ align, alignVertical, style, s, center, singlelineEllipsis, theme })}
    >
      {/* t first because that's what we are mostly be using. */}
      {t ?? text ?? children}
    </RnText>
  );
};

const singleLineEllipsisProps = { numberOfLines: 1, ellipsizeMode: 'tail' } as const;

const styles = StyleSheet.create({
  shrink: {
    flex: 0, // Else would push stuff away
    flexShrink: 1,
  },
  center: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});