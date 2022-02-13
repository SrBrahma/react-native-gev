// Modified version of https://github.com/callstack/react-native-paper/blob/main/src/components/Snackbar.tsx
import * as React from 'react';
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../..';
import { Text } from './Text';



export type SnackbarTypes = 'neutral' | 'error';

export type SnackbarProps = {
  distance?: number;
  /** @default 'bottom' */
  position?: 'top' | 'bottom';
  /** Whether the Snackbar is currently visible. */
  visible: boolean;
  /** What is the purpose of this snackbar. It defines the colors and in the future the left icons.
   * @default neutral */
  type?: SnackbarTypes;
  /**
   * Label and press callback for the action button. It should contain the following properties:
   * - `label` - Label of the action button
   * - `onPress` - Callback that is called when action button is pressed.
   */
  action?: PressableProps & {
    label: string;
  };
  /** The duration for which the Snackbar is shown. */
  duration?: number;
  /** Callback called when Snackbar is dismissed. The `visible` prop needs to be updated when this is called.
   * It has a false as argument so you can `onDismiss={setSnackbarVisible}`. */
  onDismiss: (v: false) => void;
  /** Text content of the Snackbar. */
  text: React.ReactNode;
  // children: React.ReactNode
  /** Style for the wrapper of the snackbar. */
  wrapperStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const DURATION_SHORT = 3000;
const DURATION_MEDIUM = 5000;
const DURATION_LONG = 7000;


export function Snackbar({
  distance = 60,
  visible,
  type = 'error',
  position = 'bottom',
  // action,
  duration = DURATION_MEDIUM,
  onDismiss,
  text,
  wrapperStyle,
  contentStyle,
}: SnackbarProps): JSX.Element | null {
  const { current: opacity } = React.useRef<Animated.Value>(new Animated.Value(0.0));
  const [hidden, setHidden] = React.useState<boolean>(!visible);
  const hideTimeout = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const scale = 1; // used theme.animation;

  React.useEffect(() => {
    return () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); };
  }, []);

  React.useLayoutEffect(() => {
    if (visible) { // show
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setHidden(false);
      Animated.timing(opacity, {
        toValue: 1, duration: 200 * scale, useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          const isInfinity = duration === Number.POSITIVE_INFINITY || duration === Number.NEGATIVE_INFINITY;
          if (!isInfinity)
            hideTimeout.current = setTimeout(() => onDismiss(false), duration) as unknown as NodeJS.Timeout;
        }
      });
    } else { // hide
      if (hideTimeout.current) clearTimeout(hideTimeout.current);

      Animated.timing(opacity, {
        toValue: 0,
        duration: 100 * scale,
        useNativeDriver: true,
      }).start(({ finished }) => { if (finished) setHidden(true); });
    }
  }, [visible, duration, opacity, scale, onDismiss]);


  const theme = useTheme();

  if (hidden) return null;

  // const {
  //   style: actionStyle,
  //   label: actionLabel,
  //   onPress: onPressAction,
  //   ...actionProps
  // } = action || {};

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
        // transform: [{ scale: visible ? opacity.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) : 1 }],
      }}>
        <Shadow
          startColor='#00000028'
          distance={3}
          offset={[0, 1]}
          containerViewStyle={s.container2}
        >
          <View pointerEvents='none' style={[
            s.content, {
              borderRadius: theme.sizes.roundness,
              backgroundColor,
            },
            contentStyle,
          ]}>
            {icon}
            <Text accessibilityLiveRegion='polite' style={[s.text, {
              color: textColor,
              fontFamily: theme.fonts.medium,
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
    // justifyContent: 'space-between',
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
  // button: {
  //   marginHorizontal: 8,
  //   marginVertical: 6,
  // },
});


// {action ? (
// <Button
//   onPress={() => {
//     onPressAction?.();
//     onDismiss();
//   }}
//   style={[styles.button, actionStyle]}
//   color={colors.accent}
//   compact
//   mode='text'
//   {...actionProps}
// >
//   {actionLabel}
// </Button>
// ) : null}