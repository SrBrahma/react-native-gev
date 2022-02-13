import { StyleProp, StyleSheet, Text as RnText, TextProps as RnTextProps, TextStyle } from 'react-native';
import { useTheme } from '../..';



export type TextProps = {
  /** Shortcut prop instead using children to pass the text. */
  text?: React.ReactNode;
  /** Shortcut prop instead using children to pass the text. Alias to text prop. */
  t?: React.ReactNode;
  /** Alias to style. */
  s?: StyleProp<TextStyle>;
  /** Besides numberOfLines: 1, will ellipsis and shrink the text if going outside the maximum size. */
  singlelineEllipsis?: boolean;
} & RnTextProps;

export const Text: React.FC<TextProps> = ({
  t, text, children, s: sProp, singlelineEllipsis, style,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <RnText
      {...singlelineEllipsis && { numberOfLines: 1, ellipsizeMode: 'tail' }}
      {...rest}
      style={[
        s.style,
        singlelineEllipsis && s.shrink,
        {
          fontFamily: theme.fonts.regular,
          color: theme.colors.text,
        },
        sProp ?? style,
      ]}
    >
      {t ?? text ?? children}
    </RnText>
  );
};

const s = StyleSheet.create({
  style: {
    includeFontPadding: false,
  },
  shrink: {
    flex: 0, // Else would push stuff away
    flexShrink: 1,
  },
});