import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, BackHandler, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../main/theme';

// To avoid state loss - https://github.com/callstack/react-native-paper/issues/736#issuecomment-455678596


type ElementAndId = {element: JSX.Element; id: string};

const { useGlobalState, setGlobalState } = createGlobalState({
  components: [] as ElementAndId[],
  portals: [] as ElementAndId[],
  metaIdsAskedToRetire: {} as Record<string, true>,
});


// No need to have it on a state.
let counter = 0;
function generateId() {
  return String(counter++);
}



/** Use this instead of `addPortal` if your component already knows how to position itself etc (TODO improve this etc).
 *
 * This will simply add the given component to
 *
 * Pass the key if you are updating an already added compononent.
 *
 * Returns the modal/portal key. */
export function addToPortalsAndModals(component: JSX.Element | ((key: string) => JSX.Element), o?: {id?: string}): string {
  const id = o?.id ?? generateId();
  setGlobalState('components', (items) => {
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

/** Removes Portals added by `addPortal`.
 *
 * The `id` argument must be the same as the one returned by addPortalComponent. */
export function removeFromPortalsAndModals(id: string | number): void {
  setGlobalState('components', (items) => items.filter((m: ElementAndId) => id !== m.id));
}


/** Use this if your component is already wrapped by a Portal but not being rendered directly.
 *
 * This will add it to the <PortalsAndModals/> and make all the logics to make it work. */
export function addPortal(element: JSX.Element): string {
  const id = generateId();
  setGlobalState('portals', (items) => [...items, { element, id }]);
  return id;
}

/** Use this to remove portals added by addPortalComponent.
 *
 * The second paramenter, mode, can be either 'animation' (default) or 'now'. 'animation' will let
 * the Portal component to do its animation before being removed, unlike 'now'.
 *
 * The `id` argument must be the same as the one returned by addPortalComponent. */
export function removePortal(id: string | number, mode: 'now' | 'animation' = 'animation'): void {
  if (mode === 'animation')
    setGlobalState('metaIdsAskedToRetire', (ids) => ({
      ...ids,
      ...{ [id]: true as const },
    }));
  else
    setGlobalState('portals', (items) => items.filter((m: ElementAndId) => id !== m.id));
}


type MetaContext = { id: string } | undefined;
/** For the Portals meta to know their id. */
const MetaContext = createContext<MetaContext>(undefined);

/** Global state */
// TODO add way to select the PortalsAndModals component, like target: string.
// This way, we can have like <PortalsAndModals id='snackbar'/>, and addSnackbar({}: {id?: string})
// Add someway to stack them https://material.io/archive/guidelines/components/snackbars-toasts.html
export function PortalsAndModals(): JSX.Element {
  const [components] = useGlobalState('components');
  const [portals] = useGlobalState('portals');
  return (<>
    {/* meta won't render anything but controls the modals */}
    {portals.map((m) => <MetaContext.Provider value={{ id: m.id }} key={m.id}>{m.element}</MetaContext.Provider>)}
    {components.map((m) => <Fragment key={m.id}>{m.element}</Fragment>)}
  </>);
}



const fadeDefaultDuration = 250;


export type PortalProps = {
  /** While not usually needed (even without using this it will have animation on mount and unmount),
   * this may be useful if you have something like:
   *
   * ```jsx
   * {portalActive && <MyPortal data={portalActive}/>}
   *
   * function MyPortal() {
   * // ...
   * return <PortalView>
   *   <Text>{data.value}</Text>
   * </PortalView>
   * }
   *
   * ```
   *
   * If portalActive is falsy, during the unmount animation it will still try to access its data,
   * causing an error, like `undefined is not an object`.
   *
   * @default true
   */
  visible?: boolean;
  /** Style of the View that wraps your children.
   *
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
  style?: StyleProp<ViewStyle>;
  /** If shall give a dark background. Will also darken StatusBar and NavigationBar.
   *
   * It's a shortcut to viewStyle.backgroundColor.
   * @default true */
  darken?: boolean;
  /** Called when pressed outside your content, aka the backdrop, or when the Android back button is pressed. */
  onRequestClose?: () => void;
  /** Called when the unmount animation finishes and the Portal is no longer visible. */
  onDisappear?: () => void;
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
};

export const Portal: React.FC<PortalProps> = ({
  children, style, darken = true, onRequestClose, fade = fadeDefaultDuration,
  requestCloseOnOutsidePress = true, visible = true, onDisappear,
}) => {
  const { colors } = useTheme();
  const fadeDuration = fade === true ? fadeDefaultDuration : (fade || 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const portalId = useRef<undefined | string>();
  const metaData = useContext(MetaContext); // May be undefined if added via component instead addPortal().
  const [metaIdsToRetire, setMetaIdsToRetire] = useGlobalState('metaIdsAskedToRetire');

  const state = useRef<'invisible' | 'mountingAnimation' | 'visible' | 'unmountingAnimation'>('invisible');


  const doUnmount = useCallback(() => {
    if (state.current === 'visible' || state.current === 'mountingAnimation') {
      state.current = 'unmountingAnimation';
      Animated.timing(fadeAnim, { toValue: 0, duration: fadeDuration, useNativeDriver: true }).start(({ finished }) => {
        if (finished) {
          state.current = 'invisible';
          portalId.current && removeFromPortalsAndModals(portalId.current); // No need to !== undefined, it's a string not number (won't be 0)
          metaData?.id && removePortal(metaData.id, 'now');
          onDisappear?.();
        }
      });
    }
  }, [fadeAnim, fadeDuration, metaData?.id, onDisappear]);

  const doMount = useCallback(() => {
    if (state.current === 'invisible' || state.current === 'unmountingAnimation') {
      state.current = 'mountingAnimation';
      Animated.timing(fadeAnim, { toValue: 1, duration: fadeDuration, useNativeDriver: true }).start(({ finished }) => {
        if (finished) {
          state.current = 'visible';
        }
      });
    }
  }, [fadeAnim, fadeDuration]);


  /** Check if it was required for this portal to unmount. */
  useEffect(() => {
    if (metaData?.id && metaIdsToRetire[metaData.id]) {
      doUnmount();
      setMetaIdsToRetire((v) => {
        if (!metaData.id) return v;
        const newIds = { ...v };
        delete newIds[metaData.id];
        return newIds;
      });
    }
  }, [doUnmount, metaData?.id, metaIdsToRetire, setMetaIdsToRetire]);

  /** Handle `visible` prop change. As it defaults to true, it also handles the onMount event. */
  const prevVisible = useRef<boolean | null>(null);
  useEffect(() => {
    if (visible !== prevVisible.current) {
      prevVisible.current = visible;
      if (visible)
        doMount();
      else
        doUnmount();
    }
  }, [doMount, doUnmount, visible]);

  /** Animate on unmount */
  const isUnmounting = useRef(false);
  useEffect(() => () => { isUnmounting.current = true; }, []);
  useEffect(() => () => { isUnmounting.current && doUnmount(); }, [doUnmount]);


  /** Update the portal on component change. Reuses the same key */

  const component = useMemo(() => (
    <Pressable onPress={() => requestCloseOnOutsidePress && onRequestClose?.()} style={s.container}>
      <Animated.View
        style={[
          s.viewStyle,
          { opacity: fadeAnim },
          darken && { backgroundColor: colors.backdrop },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  ), [children, colors.backdrop, darken, fadeAnim, onRequestClose, requestCloseOnOutsidePress, style]);

  /** Handle component update. */
  useEffect(() => {
    if (state.current !== 'invisible')
      portalId.current = addToPortalsAndModals(component, { id: portalId.current });
  }, [component]);

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
};


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