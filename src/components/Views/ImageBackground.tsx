// https://docs.expo.dev/versions/latest/react-native/imagebackground/
import type { ImageBackgroundProps as RnImageBackgroundProps } from 'react-native';
import { ImageBackground as RnImageBackground, StyleSheet } from 'react-native';



export type ImageBackgroundProps = RnImageBackgroundProps & {
  /** Shortcut for imageStyle={{opacity}} */
  opacity?: number;
};


/** Simple wrapper for React Native's <ImageBackground/> for a config-less usage.
 *
 * It applies a width/height style of '100%', resizeMode='cover' and `opacity` shortcut prop.
 *
 * The content to be above it need to be passed as children to it. */
export const ImageBackground: React.FC<ImageBackgroundProps> = ({ opacity, style, ...rest }) => {
  return <RnImageBackground
    {...rest}
    resizeMode='cover'
    style={[s.container, style]}
    imageStyle={{ opacity }}
  />;
};

const s = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});