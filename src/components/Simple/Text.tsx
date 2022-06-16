import type { StyleProp, TextProps as RnTextProps, TextStyle } from 'react-native';
import { StyleSheet, Text as RnText } from 'react-native';
import type { OmitKey } from '../../internalUtils/types';
import type { ThemeReturn } from '../../main';
import { useTheme } from '../../main';



export type TextArray = {
  /** The style of this text part.
   *
   * Styles such as paddings and margins won't work due to how nested Texts are implemented in Android. */
  s?: StyleProp<TextStyle>;
  /** Text. */
  t: React.ReactNode;
  /** Key. Defaults to the item's index. */
  k?: string;
}[];
export type TextProp = React.ReactNode | TextArray;

export type GevTextProps = {
  /**
   * Shortcut prop instead using children to pass the text.
   *
   * It also allows having a array of texts, being each item an object containing the text and its style.
   *
   * @example
   *
   * <Text t='Hi, world!'/>
   */
  t?: TextProp;
  /** Alias to style. */
  s?: StyleProp<TextStyle>;
  /** Ellipsizes the singleline text if Shortcut to <... numberOfLines={1} ellipsizeMode={x} style={{ flex: 0, flexShrink: 1 }} */
  singlelineEllipsis?: true;
  /** Shortcut to <... numberOfLines={1} adjustsFontSizeToFit> */
  //  TODO sure about this? Maybe revisit this and create a `singleline` prop?
  //  singlelineAdjustFontSize?: boolean;
  /** Shortcut to `style: { textAlign: X }`. `'center'` if true. */
  align?: true | TextStyle['textAlign'];
  /** Shortcut to `style: { textAlignVertical: X }`. `'center'` if true.
   *
   * Beware that iOS doesn't support `textAlignVertical`. You shall prefer wrapping the Text with a View with `justifyContent: 'center'`. */
  // Is this useful? Android only as stated, and 'center' is already the default (actually 'auto', although ain't sure the dif.).
  alignVertical?: true | TextStyle['textAlignVertical'];
  /** Shortcut to `style: { textAlign: 'center', textAlignVertical: 'center' }`.
   *
   * Beware that iOS doesn't support `textAlignVertical`. You shall prefer wrapping the Text with a View with `justifyContent: 'center'`. */
  center?: true;
  /** Shortcut to `style: { marginTop: X }`. */
  marginTop?: number | string;
  /** Shortcut to `style: { color: X }`. */
  // Unsure about this. Maybe this clutter too much. Never used it on may apps. Maybe useful for themeing
  color?: TextStyle['color'];
};

export type TextProps = RnTextProps & GevTextProps;

type MergeTextStyle = OmitKey<GevTextProps, 't'> & {
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

function getTexts(textArray: TextArray) {
  // Will this need key? How we will set it?
  return textArray.map(({ s, t, k }, i) => <RnText key={k ?? i} style={s}>{t}</RnText>);
}

/** Wrapper for the Text component.
 *
 * * `includeFontPadding: false` style by default. When `true`, it is usually bad for vertical centering.
 *
 * And adds the properties:
 *
 * * `t` to be used instead of children. Smaller and more readable code.
 * * `s`, alias to `style`.
 * * `align`, shortcut to `style: { textAlign: X }`. `'center'` if true.
 * * `alignVertical`, shortcut to `style: { textAlignVertical: X }`. `'center'` if true.
 * * `center`, shortcut to style `style: { textAlign: 'center', textAlignVertical: 'center' }`.
 * * `singlelineEllipsis`, besides numberOfLines: 1, will ellipsis and shrink the text if going outside the maximum size.
 */
export const Text: React.FC<TextProps> = ({
  align, alignVertical, center, style, s, singlelineEllipsis, t, children, ...rest
}) => {
  const theme = useTheme();

  const data = t !== undefined
    ? (Array.isArray(t) ? getTexts(t) : t)
    : children;

  return (
    <RnText
      {...singlelineEllipsis && singleLineEllipsisProps}
      {...rest}
      style={mergeTextStyle({ align, alignVertical, style, s, center, singlelineEllipsis, theme })}
    >
      {data}
    </RnText>
  );
};

const singleLineEllipsisProps: Partial<RnTextProps> = { numberOfLines: 1, ellipsizeMode: 'tail' };
// const singleLineAdjustFontSize: Partial<RnTextProps> = { numberOfLines: 1, adjustsFontSizeToFit: true };

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