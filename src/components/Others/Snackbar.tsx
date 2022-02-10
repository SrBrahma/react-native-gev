// Modified version of https://github.com/callstack/react-native-paper/blob/main/src/components/Snackbar.tsx
import * as React from 'react';
import {
  Animated,
  PressableProps,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { useTheme } from '../..';
import { Text } from './Text';



export type SnackbarTypes = 'neutral' | 'error';

export type SnackbarProps = {
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
  children: React.ReactNode;
  /** Style for the wrapper of the snackbar. */
  wrapperStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const DURATION_SHORT = 3000;
const DURATION_MEDIUM = 5000;
const DURATION_LONG = 7000;


const Snackbar = ({
  visible,
  type,
  action,
  duration = DURATION_MEDIUM,
  onDismiss,
  children,
  wrapperStyle,
  contentStyle,
}: SnackbarProps) => {
  const { current: opacity } = React.useRef<Animated.Value>(
    new Animated.Value(0.0),
  );
  const [hidden, setHidden] = React.useState<boolean>(!visible);

  const hideTimeout = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // const { scale } = theme.animation;

  const scale = 1;

  React.useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
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
            hideTimeout.current = setTimeout(onDismiss, duration) as unknown as NodeJS.Timeout;
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

  const { textColor, backgroundColor } = (() => {
    switch (type) {
      case 'error': return {
        backgroundColor: theme.colors._snackbar.error,
        textColor: theme.colors._snackbar.textOnError,
      };
      case 'neutral':
      default: return {
        backgroundColor: theme.colors._snackbar.neutral,
        textColor: theme.colors._snackbar.textOnNeutral,
      };
    }
  })();

  return (
    <SafeAreaView pointerEvents='box-none' style={[s.wrapper, wrapperStyle]}>
      <Animated.View pointerEvents='box-none' style={{
        opacity,
        transform: [{ scale: visible ? opacity.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) : 1 }],
      }}>
        <Shadow
          viewStyle={[
            s.container, {
              borderRadius: theme.common.roundness,
              backgroundColor,
            }, contentStyle,
          ]}
        >
          <Text accessibilityLiveRegion='polite' style={[s.content, { marginRight: action ? 0 : 16, color: textColor }]}>
            {children}
          </Text>
        </Shadow>
      </Animated.View>
    </SafeAreaView>
  );
};

/** Show the Snackbar for a short duration. */
Snackbar.DURATION_SHORT = DURATION_SHORT;
/** Show the Snackbar for a medium duration. */
Snackbar.DURATION_MEDIUM = DURATION_MEDIUM;
/** Show the Snackbar for a long duration. */
Snackbar.DURATION_LONG = DURATION_LONG;


const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 8,
    borderRadius: 4,
  },
  content: {
    marginLeft: 16,
    marginVertical: 14,
    flexWrap: 'wrap',
    flex: 1,
  },
  // button: {
  //   marginHorizontal: 8,
  //   marginVertical: 6,
  // },
});


{/* {action ? (
          <Button
            onPress={() => {
              onPressAction?.();
              onDismiss();
            }}
            style={[styles.button, actionStyle]}
            color={colors.accent}
            compact
            mode='text'
            {...actionProps}
          >
            {actionLabel}
          </Button>
        ) : null} */}