import { createContext, Fragment, useCallback, useContext, useEffect, useRef } from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, BackHandler, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../main/theme';

// To avoid state loss - https://github.com/callstack/react-native-paper/issues/736#issuecomment-455678596



// https://stackoverflow.com/a/54178819/10247962
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Item = {element: JSX.Element; id: string};

const { useGlobalState, setGlobalState } = createGlobalState({
  modals: [] as Item[],
  modalsMeta: [] as Item[],
  metaIdsAskedToRetire: {} as Record<string, true>,
});


// No need at all to have it on a state.
let counter = 0;
function generateId() {
  return String(counter++);
}



/** Global state. It can both add Modals and Portals.
 *
 * You shouldn't manually create the key.
 *
 * Returns the modal/portal key. */
export function addPortal(component: JSX.Element | ((key: string) => JSX.Element), o?: {id?: string}): string {
  const id = o?.id ?? generateId();
  setGlobalState('modals', (items) => {
    // Replace if key already exists
    const newItems = [...items];
    const element = typeof component === 'function' ? component(id) : component;

    const keyExists = items.findIndex((i) => i.id === id);
    if (keyExists > -1)
      newItems[keyExists] = { element, id };
    else
      newItems.push({ element, id });

    return newItems;
  });
  return id;
}

/** Global state */
export function removePortal(id: React.Key): void {
  setGlobalState('modals', (items) => items.filter((m: Item) => id !== m.id));
}

/** Lets the portal to do its removal animation and then remove itself. */
export function askPortalMetaRemoval(id: React.Key): void {
  setGlobalState('metaIdsAskedToRetire', (ids) => ({
    ...ids,
    ...{ [id]: true as const },
  }));
}



export function addPortalMeta(element: JSX.Element): string {
  const id = generateId();
  setGlobalState('modalsMeta', (items) => [...items, { element, id }]);
  return id;
}


/** Global state */
export function removePortalMeta(id: React.Key): void {
  setGlobalState('modalsMeta', (items) => items.filter((m: Item) => id !== m.id));
}


type MetaContext = { id: string } | undefined;
/** For the Portals meta to know their id. */
const MetaContext = createContext<MetaContext>(undefined);

/** Global state */
// TODO add way to select the ModalsAndPortals component, like target: string.
// This way, we can have like <ModalsAndPortals id='snackbar'/>, and addSnackbar({}: {id?: string})
// Add someway to stack them https://material.io/archive/guidelines/components/snackbars-toasts.html
export function ModalsAndPortals(): JSX.Element {
  const [modals] = useGlobalState('modals');
  const [modalsMeta] = useGlobalState('modalsMeta');
  return (<>
    {/* meta won't render anything but controls the modals */}
    {modalsMeta.map((m) => <MetaContext.Provider value={{ id: m.id }} key={m.id}>{m.element}</MetaContext.Provider>)}
    {modals.map((m) => <Fragment key={m.id}>{m.element}</Fragment>)}
  </>);
}



const fadeDefaultDuration = 250;

export function Portal({
  children, viewStyle, darken = true, onRequestClose, fade = fadeDefaultDuration,
  requestCloseOnOutsidePress = true,
}: {
  children: JSX.Element | null;
  /**
   * @default
   * ```
   * {
   *   flex: 1,
   *   alignItems: 'center',
   *   justifyContent: 'center',
   * }
   * ```
   *
   * as you will most usually want it to act like a centered modal.
   */
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
  const fadeDuration = fade === true ? fadeDefaultDuration : (fade || 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isMounting = useRef<boolean>(true);
  const isUnmounting = useRef<boolean>(false);
  const portalId = useRef<undefined | string>();
  const metaData = useContext(MetaContext); // May be undefined if added via component instead addPortal().
  const [metaIdsToRetire, setMetaIdsToRetire] = useGlobalState('metaIdsAskedToRetire');


  const isAnimatingToUnmount = useRef(false);
  const animateToUnmount = useCallback(() => {
    if (!isAnimatingToUnmount.current) {
      isAnimatingToUnmount.current = true;
      Animated.timing(fadeAnim, { toValue: 0, duration: fadeDuration, useNativeDriver: true }).start(() => {
        portalId.current && removePortal(portalId.current); // No need to !== undefined, it's a string not number (won't be 0)
        metaData?.id && removePortalMeta(metaData.id);
      });
    }
  }, [fadeAnim, fadeDuration, metaData]);


  /** Check if it was required for this portal to unmount. */
  useEffect(() => {
    if (metaData?.id && metaIdsToRetire[metaData.id]) {
      animateToUnmount();
      setMetaIdsToRetire((v) => {
        if (!metaData.id) return v;
        const newIds = { ...v };
        delete newIds[metaData.id];
        return newIds;
      });
    }
  }, [animateToUnmount, metaData?.id, metaIdsToRetire, setMetaIdsToRetire]);


  /** Set isUnmounting=true on unmount. */
  useEffect(() => { return () => { isUnmounting.current = true; }; }, []);


  /** Update the portal on component change. Reuses the same key */
  useEffect(() => {
    const component = (
      <Pressable onPress={() => requestCloseOnOutsidePress && onRequestClose?.()} style={s.container}>
        <Animated.View
          style={[
            s.viewStyle,
            { opacity: fadeAnim },
            darken && { backgroundColor: colors.backdrop },
            viewStyle,
          ]}>
          {children}
        </Animated.View>
      </Pressable>
    );
    portalId.current = addPortal(component, { id: portalId.current });
  }, [children, colors.backdrop, darken, fadeAnim, onRequestClose, requestCloseOnOutsidePress, viewStyle]);


  /** Animate on mount */
  useEffect(() => {
    if (isMounting.current)
      Animated.timing(fadeAnim, { toValue: 1, duration: fadeDuration, useNativeDriver: true }).start();
  }, [fadeAnim, fadeDuration, isMounting]);


  /** Animate on unmount */
  useEffect(() => (() => { isUnmounting.current && animateToUnmount(); }), [animateToUnmount]);


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


  /** Set isMounting=false */
  useEffect(() => { isMounting.current = false; }, []);

  return null;
}




const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  viewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});