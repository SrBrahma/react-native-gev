// Modified version of https://github.com/callstack/react-native-paper/blob/main/src/components/Snackbar.tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, SafeAreaView, StyleSheet, View } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../main';
import { Text } from '../Simple/Text';



export type SnackbarTypes = 'neutral' | 'error';

type Text = React.ReactNode;

export type SnackbarProps = {
  /** The vertical distance from top or bottom.
   * @default 60 */
  distance?: number;
  /** If it will be positioned on 'top' or 'bottom'
   * @default 'bottom' */
  position?: 'top' | 'bottom';
  /** Whether the Snackbar is currently visible.
   * @default !!text */
  visible?: boolean;
  /** What is the purpose of this snackbar. It defines the colors and in the future the left icons.
   * @default 'error' */
  type?: SnackbarTypes;
  /** How long it will be shown before calling `onTimeout`.
   * @default DURATION_MEDIUM = 5000ms */
  duration?: number;
  /** Callback called when the `duration` time is ellapsed, after `visible` is true.
   *
   * The `visible` prop should be set to false when this is called, so the fade animation begins.
   *
   * It has a false as argument so you can `onTimeout={setSnackbarVisible}`. */
  onTimeout: (v: false) => void;
  /** Called when the unmount animation finishes and the Snackbar is no longer visible. */
  onDisappear?: () => void;
  /** Text content of the Snackbar. */
  text: Text;
  /** Style for the wrapper of the snackbar. */
  wrapperStyle?: StyleProp<ViewStyle>;
  /** Style of the View wrapping the icon and the text. */
  contentStyle?: StyleProp<ViewStyle>;
};

const DURATION_SHORT = 3000;
const DURATION_MEDIUM = 5000;
const DURATION_LONG = 7000;


export function Snackbar({
  distance = 60,
  type = 'error',
  position = 'bottom',
  duration = DURATION_MEDIUM,
  onTimeout, onDisappear,
  text: textProp,
  visible = !!textProp,
  wrapperStyle,
  contentStyle,
}: SnackbarProps): JSX.Element | null {
  const { current: opacity } = useRef<Animated.Value>(new Animated.Value(0.0));
  const [hidden, setHidden] = useState<boolean>(!visible);
  const hideTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const scale = 1; // used theme.animation;

  /** This is useful if the user used visible={!!text}. Being so, when the onDismiss is called, the text would
   * be cleared and we would have on the fade animation an empty snackbar.
   */
  const lastTextWhenWasVisible = useRef<Text | null>(null);
  useEffect(() => {
    if (visible)
      lastTextWhenWasVisible.current = textProp;
  }, [textProp, visible]);
  const text = (visible ? textProp : lastTextWhenWasVisible.current) || '';

  useEffect(() => {
    return () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); };
  }, []);

  useLayoutEffect(() => {
    if (visible) { // show
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setHidden(false);
      Animated.timing(opacity, {
        toValue: 1, duration: 200 * scale, useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          const isInfinity = duration === Number.POSITIVE_INFINITY || duration === Number.NEGATIVE_INFINITY;
          if (!isInfinity)
            hideTimeout.current = setTimeout(() => onTimeout(false), duration) as unknown as NodeJS.Timeout;
        }
      });
    } else { // hide
      if (hideTimeout.current) clearTimeout(hideTimeout.current);

      Animated.timing(opacity, {
        toValue: 0,
        duration: 100 * scale,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setHidden(true);
          onDisappear?.();
        }
      });
    }
  }, [visible, duration, opacity, scale, onTimeout, onDisappear]);


  const theme = useTheme();

  if (hidden) return null;

  const { textColor, backgroundColor, icon } = (() => {
    switch (type) {
      case 'error': return {
        backgroundColor: theme.colors._snackbar.error,
        textColor: theme.colors._snackbar.textOnError,
        icon: <MaterialCommunityIcons name='alert-circle' color={theme.colors._snackbar.textOnError} style={s.icon}/>,
      };
      case 'neutral':
      default: return {
        backgroundColor: theme.colors._snackbar.neutral,
        textColor: theme.colors._snackbar.textOnNeutral,
        icon: undefined,

      };
    }
  })();

  return (
    <SafeAreaView pointerEvents='box-none' style={[s.wrapper, { ...position === 'top' ? { top: distance } : { bottom: distance } }, wrapperStyle]}>
      <Animated.View pointerEvents='box-none' style={{
        position: 'relative',
        opacity,
        transform: [{ scale: visible ? opacity.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) : 1 }],
      }}>
        <Shadow
          startColor='#00000028'
          distance={3}
          offset={[0, 1]}
          containerViewStyle={s.container2}
        >
          <View pointerEvents='none' style={[
            s.content, {
              borderRadius: 4,
              backgroundColor,
            },
            contentStyle,
          ]}>
            {icon}
            <Text accessibilityLiveRegion='polite' style={[s.text, {
              color: textColor,
              ...theme.fonts.medium,
            }]} t={text}/>
          </View>
        </Shadow>
      </Animated.View>
    </SafeAreaView>
  );
}


/** Show the Snackbar for a short duration. */
Snackbar.DURATION_SHORT = DURATION_SHORT;
/** Show the Snackbar for a medium duration. */
Snackbar.DURATION_MEDIUM = DURATION_MEDIUM;
/** Show the Snackbar for a long duration. */
Snackbar.DURATION_LONG = DURATION_LONG;


const s = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    top: undefined, bottom: undefined,
    alignItems: 'center',
  },
  // The shadow container
  container2: {
    marginHorizontal: 40, // Horizontal distance to screen borders
  },
  // The painted box
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 26,
    borderRadius: 4,
  },
  icon: {
    fontSize: 15,
    marginLeft: -8,
    marginRight: 13,
  },
  // The text or content
  text: {
    paddingVertical: 16, // padding instead margin so we catch the press and ignore it.
    flexWrap: 'wrap',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});