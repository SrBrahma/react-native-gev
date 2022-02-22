// https://docs.expo.dev/versions/latest/react-native/imagebackground/
import type { ImageBackgroundProps as RnImageBackgroundProps } from 'react-native';
import { ImageBackground as RnImageBackground, StyleSheet } from 'react-native';



export type ImageBackgroundProps = RnImageBackgroundProps & {
  /** Shortcut for style={{opacity}} */
  opacity?: number;
};

/** Simple wrapper for React Native's <ImageBackground/> for a config-less usage.
 *
 * It applies a width/height style of '100%', resizeMode='cover' and `opacity` shortcut prop.
*/
export function ImageBackground({ opacity, style, ...rest }: ImageBackgroundProps): JSX.Element {
  return <RnImageBackground
    {...rest}
    resizeMode='cover'
    style={[s.container, { opacity }, style]}
    // source={background}
    // resizeMode='cover'
    // style={s.container}
  />;
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});