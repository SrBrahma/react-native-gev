import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import { Animated, BackHandler, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';

// To avoid state loss - https://github.com/callstack/react-native-paper/issues/736#issuecomment-455678596



// https://stackoverflow.com/a/54178819/10247962
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Item = {element: JSX.Element; id: string};

const { useGlobalState, setGlobalState } = createGlobalState({
  modals: { counter: 0, items: [] as Item[] },
  modalsMeta: { counter: 0, items: [] as Item[] },
  idsAskedToRetire: {} as Record<string, true>,
});





/** Global state. It can both add Modals and Portals.
 *
 * You shouldn't manually create the key.
 *
 * Returns the modal/portal key. */
export function addPortal(component: JSX.Element | ((key: string) => JSX.Element), o?: {id?: string}): string {
  let id = '';
  setGlobalState('modals', (modals) => {
    id = o?.id ?? String(modals.counter);

    // Replace if key already exists
    const newItems = [...modals.items];
    const element = typeof component === 'function' ? component(id) : component;

    const keyExists = modals.items.findIndex((i) => i.id === id);
    if (keyExists > -1)
      newItems[keyExists] = { element, id };
    else
      newItems.push({ element, id });

    return {
      items: newItems,
      counter: modals.counter + 1,
    };
  });
  return id;
}

/** Global state */
export function removePortal(id: React.Key): void {
  setGlobalState('modals', ({ counter, items }) => ({
    counter,
    items: items.filter((m: Item) => id !== m.id),
  }));
}
/** Lets the portal to do its removal animation and then remove itself. */
export function askPortalMetaRemoval(id: React.Key): void {
  setGlobalState('idsAskedToRetire', (ids) => ({
    ...ids,
    ...{ [id]: true as const },
  }));
}



export function addPortalMeta(element: JSX.Element): string {
  let id = '';
  setGlobalState('modalsMeta', ({ counter, items }) => {
    id = String(counter);
    return {
      items: [...items, { element, id }],
      counter: counter + 1,
    };
  });
  return id;
}
/** Global state */
export function removePortalMeta(id: React.Key): void {
  setGlobalState('modalsMeta', ({ counter, items }) => ({
    counter,
    items: items.filter((m: Item) => id !== m.id),
  }));
}


const MetaContext = createContext<{id: string}>({ id: '' });

/** Global state */
// TODO add way to select the ModalsAndPortals component, like target: string.
// This way, we can have like <ModalsAndPortals id='snackbar'/>, and addSnackbar({}: {id?: string})
// Add someway to stack them https://material.io/archive/guidelines/components/snackbars-toasts.html
export function ModalsAndPortals(): JSX.Element {
  const [modals] = useGlobalState('modals');
  const [modalsMeta] = useGlobalState('modalsMeta');
  return (<>
    {/* meta won't render anything but controls the modals */}
    {modalsMeta.items.map((m) => <MetaContext.Provider value={{ id: m.id }} key={m.id}>{m.element}</MetaContext.Provider>)}
    {modals.items.map((m) => <Fragment key={m.id}>{m.element}</Fragment>)}
  </>
  );
}



const fadeDefaultDuration = 250;

export function Portal({
  children, viewStyle, darken, onRequestClose, fade = fadeDefaultDuration,
  requestCloseOnOutsidePress = true, id: idProp,
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
  id?: string;
}): null {
  const { colors } = useTheme();
  const fadeDuration = fade === true ? fadeDefaultDuration : (fade || 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isMounting = useRef<boolean>(true);
  const isUnmounting = useRef<boolean>(false);
  const portalId = useRef<undefined | string>(idProp);
  const metaData = useContext(MetaContext);
  const [idsToRetire, setIdsToRetire] = useGlobalState('idsAskedToRetire');


  const animateToUnmount = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: fadeDuration, useNativeDriver: true }).start(() => {
      portalId.current && removePortal(portalId.current);
      removePortalMeta(metaData.id);
    });
  }, [fadeAnim, fadeDuration, metaData.id]);

  useEffect(() => {
    if (portalId.current && idsToRetire[portalId.current]) {
      animateToUnmount();
      setIdsToRetire((v) => {
        if (!portalId.current) return v;
        const newIds = { ...v };
        delete newIds[portalId.current];
        return newIds;
      });
    }
  }, [animateToUnmount, idsToRetire, setIdsToRetire]);

  useEffect(() => { return () => { isUnmounting.current = true;}; }, []);


  const Component = useMemo(() => (
    <Pressable onPress={() => requestCloseOnOutsidePress && onRequestClose?.()} style={s.container}>
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

  /** Update the portal on component change. Reuses the same key */
  useEffect(() => { portalId.current = addPortal(Component, { id: portalId.current }); }, [Component, portalId]);

  /** Animate on mount */
  useEffect(() => {
    if (isMounting.current)
      Animated.timing(fadeAnim, { toValue: 1, duration: fadeDuration, useNativeDriver: true }).start();
  }, [fadeAnim, fadeDuration, isMounting]);

  /** Animate on unmount */
  useEffect(() => (() => { isUnmounting.current && animateToUnmount();}), [animateToUnmount]);

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