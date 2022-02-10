import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import { Animated, BackHandler, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';

// To avoid state loss - https://github.com/callstack/react-native-paper/issues/736#issuecomment-455678596



// https://stackoverflow.com/a/54178819/10247962
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Item = {element: JSX.Element; key: string};

const { useGlobalState, setGlobalState } = createGlobalState({
  modals: { counter: 0, items: [] as Item[] },
  keysAskedToRetire: {} as Record<string, true>,
});





/** Global state. It can both add Modals and Portals.
 *
 * You shouldn't manually create the key.
 *
 * Returns the modal/portal key. */
export function addPortal(component: JSX.Element | ((key: string) => JSX.Element), o?: {key?: string}): string {
  let key = '';
  setGlobalState('modals', (modals) => {
    key = o?.key ?? String(modals.counter);

    // Replace if key already exists
    const newItems = [...modals.items];
    const element = typeof component === 'function' ? component(key) : component;

    const keyExists = modals.items.findIndex((i) => i.key === key);
    if (keyExists > -1)
      newItems[keyExists] = { element, key };
    else
      newItems.push({ element, key });

    return {
      items: newItems,
      counter: modals.counter + 1,
    };
  });
  return key;
}

/** Global state */
export function removePortal(key?: React.Key): void {
  if (key)
    setGlobalState('modals', (modals) => ({
      counter: modals.counter,
      items: modals.items.filter((m: Item) => key !== m.key),
    }));
}

export function askToRemovePortal(key: React.Key): void {
  setGlobalState('keysAskedToRetire', (k) => ({
    ...k,
    ...{ [key]: true as const },
  }));
}

// export function cleanGarbageAskToRemove() {
// }


/** Global state */
// TODO add way to select the ModalsAndPortals component, like target: string.
// This way, we can have like <ModalsAndPortals id='snackbar'/>, and addSnackbar({}: {id?: string})
// Add someway to stack them https://material.io/archive/guidelines/components/snackbars-toasts.html
export function ModalsAndPortals(): JSX.Element {
  const [modals] = useGlobalState('modals');
  return (<>
    {modals.items.map((m) => <Fragment key={m.key}>{m.element}</Fragment>)}
  </>
  );
}



const fadeDefaultDuration = 250;

export function Portal({
  children, viewStyle, darken, onRequestClose, fade = fadeDefaultDuration,
  requestCloseOnOutsidePress = true, key: keyProp,
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
  key?: string;
}): null {
  const { colors } = useTheme();
  const key = useRef<undefined | string>(keyProp);
  const fadeDuration = fade === true ? fadeDefaultDuration : (fade || 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isMounting = useRef<boolean>(false);
  const isUnmounting = useRef<boolean>(false);
  const [keysToRetire, setKeysToRetire] = useGlobalState('keysAskedToRetire');


  const animateToUnmount = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: fadeDuration, useNativeDriver: true }).start(() => {
      removePortal(key.current);
    });
  }, [fadeAnim, fadeDuration]);

  if (key.current && keysToRetire[key.current]) {
    animateToUnmount();
    setKeysToRetire((v) => {
      if (!key.current) return v;
      const newKeys = { ...v };
      delete newKeys[key.current];
      return newKeys;
    });
  }

  useEffect(() => { return () => { isUnmounting.current = true;}; }, []);



  const Component = useMemo(() => (
    <Pressable
      onPress={() => requestCloseOnOutsidePress && onRequestClose?.()}
      style={s.container}
    >
      <Animated.View
        style={[
          { flex: 1, opacity: fadeAnim },
          darken && { backgroundColor: colors.backdrop },
          viewStyle,
        ]}
        children={children}
      />
    </Pressable>
  ), [children, colors.backdrop, darken, fadeAnim, onRequestClose, requestCloseOnOutsidePress, viewStyle]);



  /** Add and remove the modal on component change.
   *
   * Don't remove the modal here if unmounting, the animation will do it. */
  useEffect(() => {
    // Reuse the same key
    key.current = addPortal(Component, { key: key.current });
    return () => { !isUnmounting.current && removePortal(key.current);};
  }, [Component, key]);

  /** Animate on mount */
  useEffect(() => {
    if (isMounting.current)
      Animated.timing(fadeAnim, { toValue: 1, duration: fadeDuration, useNativeDriver: true }).start();
  }, [fadeAnim, fadeDuration, isMounting]);


  /** Animate on unmount */
  useEffect(() => {
    return () => { isUnmounting.current && animateToUnmount();};
  }, [animateToUnmount]);


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

  useEffect(() => { isMounting.current = false; }, []);

  return null;
}


const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
});