import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import { Animated, BackHandler, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';

// To avoid state loss - https://github.com/callstack/react-native-paper/issues/736#issuecomment-455678596

type Component = JSX.Element | (() => JSX.Element);

// https://stackoverflow.com/a/54178819/10247962
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;


type Item = {component: Component; key: string};

const { useGlobalState, setGlobalState } = createGlobalState({
  modals: { counter: 0, items: [] as Item[] }
});


/** Get an unique key for the component so they won't lose the children state changes.
 *
 * This won't conflict with the normal key generated from the normal counter. This one starts with an underscore! */
let specialKeyCounter = 0;
function getSpecialKey() {
  return `_${specialKeyCounter++}`;
}


/** Global state.
 * Returns the modal/portal key. */
export function addModalOrPortal(component: Component, o?: {key?: string}): string {
  let key = '';
  setGlobalState('modals', (modals) => {
    key = o?.key ?? String(modals.counter);
    return {
      items: modals.items.concat({ component, key }),
      counter: modals.counter + 1,
    };
  });
  return key;
}

/** Global state */
export function removeModalOrPortal(componentOrKey: Component | React.Key): void {
  const removeByComponent = (m: Item) => m.component !== componentOrKey;
  const removeByKey = (m: Item) => m.key !== componentOrKey;
  setGlobalState('modals', (modals) => ({
    counter: modals.counter,
    items: modals.items.filter(typeof componentOrKey === 'string' ? removeByKey : removeByComponent),
  }));
}

/** Global state */
// TODO add way to select the ModalsAndPortals component, like target: string.
// This way, we can have like <ModalsAndPortals id='snackbar'/>, and addSnackbar({}: {id?: string})
// Add someway to stack them https://material.io/archive/guidelines/components/snackbars-toasts.html
export function ModalsAndPortals(): JSX.Element {
  const [modals] = useGlobalState('modals');
  return (<>
    {modals.items.map((m) => (typeof m.component === 'function' ? <m.component key={m.key}/> : <Fragment key={m.key}>{m.component}</Fragment>))}
  </>
  );
}


const fadeDefaultDuration = 250;

export function Portal({
  children, viewStyle, darken, onRequestClose, fade = fadeDefaultDuration,
  requestCloseOnOutsidePress = true,
}: {
  children: JSX.Element | null;
  viewStyle?: StyleProp<ViewStyle>;
  /** If shall give a dark background. Will also darken StatusBar and NavigationBar.
   *
   * It's a shortcut to viewStyle.backgroundColor.
   * @default true */
  darken?: boolean;
  onRequestClose?: () => void;
  /** If shall call onRequestClose when pressing outside.
   * @default true */
  requestCloseOnOutsidePress?: boolean;
  /** If shall fade on mount and unmount.
   *
   * If true, will use the default value. If a number, it's the duration of the animation, in ms.
   *
   * Falsy values (but not undefined) are converted to 0ms.
   *
   * @default 250 */
  fade?: true | number | false | null;
}): null {
  const { colors } = useTheme();
  /** Get an unique key for this component so we won't lose the children state changes. (prob it wasn't the reason. Leaving it here for performance)
   * Note it's `(getSpecialKey)` and not `(getSpecialKey())`, so it only runs on init. */
  const [key] = useState(getSpecialKey);

  const fadeDuration = fade === true ? fadeDefaultDuration : (fade || 0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  // const [component, setComponent] = useState<null | JSX.Element>(null);
  const isUnmounting = useRef<boolean>(false);


  const Component = useMemo(() => <Pressable
    onPress={() => requestCloseOnOutsidePress && onRequestClose?.()}
    style={s.container}
  >
    <Animated.View
      style={[
        { flex: 1, opacity: fadeAnim },
        darken && { backgroundColor: colors.backdrop },
        viewStyle,
      ]}
    >
      {children}
    </Animated.View>
  </Pressable>, [children, colors.backdrop, darken, fadeAnim, onRequestClose, requestCloseOnOutsidePress, viewStyle]);

  useEffect(() => {
    return () => { isUnmounting.current = true;};
  }, []);

  /** Animate on mount */
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: fadeDuration, useNativeDriver: true }).start();
  }, [fadeAnim, fadeDuration]);

  /** Animate on unmount */
  useEffect(() => {
    return () => {
      if (isUnmounting.current) {
        Animated.timing(fadeAnim, { toValue: 0, duration: fadeDuration, useNativeDriver: true }).start(() => {
          removeModalOrPortal(Component);
        });
      }
    };
  }, [Component, fadeAnim, fadeDuration]);


  /** Add and remove the modal on component change.
   *
   * Don't remove the modal here if unmounting, the animation will do it. */
  useEffect(() => {
    // We must enter the same key, else the children component will not keep their state changes.
    addModalOrPortal(Component, { key });
    return () => { !isUnmounting.current && removeModalOrPortal(Component);};
  }, [Component, key]);


  /** Handle the back button press */
  // TODO this will prob be messed on multiple Portals
  // https://reactnavigation.org/docs/custom-android-back-button-handling/#why-not-use-component-lifecycle-methods
  useFocusEffect(useCallback(() => {
    // If this is the one that should handle the back press.
    return BackHandler.addEventListener('hardwareBackPress', () => {
      onRequestClose?.();
      return true;
    }).remove;
  }, [onRequestClose]));

  return null;
}

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
});