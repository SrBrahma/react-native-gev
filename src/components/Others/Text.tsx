import { StyleProp, StyleSheet, Text as RnText, TextProps as RnTextProps, TextStyle } from 'react-native';



export type TextProps = {
  /** Shortcut prop instead using children to pass the text. */
  text?: string | number;
  /** Shortcut prop instead using children to pass the text. Alias to text prop. */
  t?: string | number;
  /** Alias to style. */
  s?: StyleProp<TextStyle>;
  /** Besides numberOfLines: 1, will ellipsis and shrink the text if going outside the maximum size. */
  singlelineEllipsis?: boolean;
} & RnTextProps;

export const Text: React.FC<TextProps> = ({
  t, text, children, s, singlelineEllipsis, style,
  ...rest
}) => {
  return (
    <RnText
      {...singlelineEllipsis && { numberOfLines: 1, ellipsizeMode: 'tail' }}
      {...rest}
      style={[
        styles.style,
        singlelineEllipsis && styles.shrink,
        s ?? style,
      ]}
    >
      {t ?? text ?? children}
    </RnText>
  );
};

const styles = StyleSheet.create({
  style: {
    includeFontPadding: false,
  },
  shrink: {
    flex: 0, // Else would push stuff away
    flexShrink: 1,
  },
});