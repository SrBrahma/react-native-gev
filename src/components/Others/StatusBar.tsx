// https://stackoverflow.com/a/61337461
// https://stackoverflow.com/a/39300715


import { createContext } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// From expo as it has some better default values.
import { StatusBar } from 'expo-status-bar';



type ContextData = {
  // setColor:
};

const Context = createContext<ContextData>({} as any);

export type StatusBarProviderProps = {
  /** @default false */
  useNativeDriver?: boolean;
  /** The starting color for the StatusBar.
   * @default #fff */
  backgroundColor?: ColorValue;
  /** iOS hasn't a statusBar backgroundColor by default. https://stackoverflow.com/a/39300715 */
  // changeIOSColor
  /** Set the statusBar text color */
  // barStyle
  // etc add other StaturBar props here, and then add them in the hook/component to mirror the StatusBar behavior.
  /** Style for the View that simulates the StatusBar. */
  style?: StyleProp<ViewStyle>;
};

/** You shall add it before any SafeArea Provider, and have your content inside this. */
export const StatusBarProvider: React.FC<StatusBarProviderProps> = ({
  children, backgroundColor = '#fff', style,
}) => {
  // const colorR = useRef(backgroundColor).current
  // TODO check if already applied in a parent via context, if so don't add the View again.
  // - Use both ref and state, as two Providers may be applied on the same render.
  const height = useSafeAreaInsets().top;
  return (<Context.Provider value={{}}>
    <StatusBar translucent backgroundColor='#0000'/>
    {/* Absolute positioning was causing a vertical movement on 1st->2nd render. */}
    <View style={[{ height, backgroundColor, width: '100%' }, style]}/>
    {children}
  </Context.Provider>
  );
};

// export const useStatusBar = () => {
//   return useContext(StatusBarContext);
// };