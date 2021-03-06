import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
   *
   * `outsideCapturePress` must be true (default)
   * @default true */
  requestCloseOnOutsidePress?: boolean;
  /** If pressing the Android's back button should call onRequestClose.
   *
   * @default true */
  requestCloseOnBackPress?: boolean;
  /** If the fullscreen pressable that wraps your children is target of presses.
   *
   * Set this off if your Portal shouldn't affect the press of other components, like Snackbars.
   *
   * If this is false, `requestCloseOnOutsidePress` for `onRequestClose` won't work.
   *
   * If this is false, this touch the Pressable pointerEvents from 'auto' to 'box-none'.
   *
   * @default true */
  capturePressOnOutside?: boolean;
  /** If shall fade on mount and unmount.
   *
   * If true, will use the default value. If a number, it's the duration of the animation, in ms.
   *
   * Falsy values (but not undefined) are converted to 0ms.
   *
   * @default 250 */
  fade?: true | number | false | null;
  children?: React.ReactNode;
};

export function Portal({
  children, style, darken = true, onRequestClose, fade = fadeDefaultDuration,
  requestCloseOnOutsidePress = true, visible = true, onDisappear,
  capturePressOnOutside = true, requestCloseOnBackPress = true,
}: PortalProps): JSX.Element | null {
  const { colors } = useTheme();
  const fadeDuration = fade === true ? fadeDefaultDuration : (fade || 0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const portalId = useRef<undefined | string>();
  const metaData = useContext(MetaContext); // May be undefined if added via component instead addPortal().
  const [metaIdsToRetire, setMetaIdsToRetire] = useGlobalState('metaIdsAskedToRetire');

  const prevVisible = useRef<boolean | null>(null);

  const [state, setState] = useState<'invisible' | 'visible'>('invisible');


  const unmount = useCallback(() => {
    portalId.current && removeFromPortalsAndModals(portalId.current); // No need to !== undefined, it's a string not number (won't be 0)
    metaData?.id && removePortal(metaData.id, 'now');
    onDisappear?.();
  }, [metaData?.id, onDisappear]);

  const isUnmounting = useRef(false);
  useEffect(() => () => { isUnmounting.current = true; }, []);

  const becomeInvisible = useCallback(({ doUnmount }: {doUnmount: boolean} = { doUnmount: false }) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: fadeDuration, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        if (!isUnmounting.current) // Don't change state if component no longer exists
          setState('invisible');
      }
      // To force its removal on unmount.
      if (doUnmount || isUnmounting.current)
        unmount();
    });
  }, [fadeAnim, fadeDuration, unmount]);


  /** Animate on unmount */
  useEffect(() => () => { isUnmounting.current && becomeInvisible({ doUnmount: true }); }, [becomeInvisible]);


  const becomeVisible = useCallback(() => {
    if (!isUnmounting.current) {
      setState('visible');
      Animated.timing(fadeAnim, { toValue: 1, duration: fadeDuration, useNativeDriver: true }).start();
    }
  }, [fadeAnim, fadeDuration]);



  /** Handle `visible` prop change. As it defaults to true, it also handles the onMount event. */
  useEffect(() => {
    if (visible !== prevVisible.current) {
      prevVisible.current = visible;
      if (visible)
        becomeVisible();
      else
        becomeInvisible();
    }
  }, [becomeVisible, becomeInvisible, visible]);


  /** Check if it was required for this portal to unmount. */
  useEffect(() => {
    if (metaData?.id && metaIdsToRetire[metaData.id]) {
      becomeInvisible({ doUnmount: true });
      setMetaIdsToRetire((v) => {
        if (!metaData.id) return v;
        const newIds = { ...v };
        delete newIds[metaData.id];
        return newIds;
      });
    }
  }, [becomeInvisible, metaData?.id, metaIdsToRetire, setMetaIdsToRetire]);

  /** Out of the component memo so it runs less frequently. */
  const doRender = (visible || state === 'visible');
  const component = useMemo(() => (
    doRender
      ? (
        <Pressable
          pointerEvents={capturePressOnOutside ? 'auto' : 'box-none'}
          onPress={() => requestCloseOnOutsidePress && onRequestClose?.()} style={s.container}
        >
          <Animated.View
            pointerEvents='box-none'
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
      )
      : null
  ), [children, style, onRequestClose, doRender, capturePressOnOutside, fadeAnim, darken, colors.backdrop, requestCloseOnOutsidePress]);

  /** Handle component update. */
  const prevComponent = useRef<JSX.Element | null>(null);
  useEffect(() => {
    if (component !== prevComponent.current) {
      if (component && !isUnmounting.current)
        portalId.current = addToPortalsAndModals(component, { id: portalId.current });
      // If component existed but is now invisible
      else if (prevComponent.current)
        unmount();
      prevComponent.current = component;
    }
  }, [component, unmount]);



  /** Handle the back button press */
  // TODO this will prob be messed on multiple Portals
  // https://reactnavigation.org/docs/custom-android-back-button-handling/#why-not-use-component-lifecycle-methods
  useFocusEffect(useCallback(() => {
    return BackHandler.addEventListener('hardwareBackPress', () => {
      if (requestCloseOnBackPress && state === 'visible') {
        onRequestClose?.();
        return true;
      }
    }).remove;
  }, [onRequestClose, requestCloseOnBackPress, state]));


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