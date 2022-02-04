// https://stackoverflow.com/a/61337461
// https://stackoverflow.com/a/39300715


import { createContext } from 'react';
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
  backgroundColor?: string;
  /** iOS hasn't a statusBar backgroundColor by default. https://stackoverflow.com/a/39300715 */
  // changeIOSColor
  /** Set the statusBar text color */
  // barStyle
  // etc add other StaturBar props here, and then add them in the hook/component to mirror the StatusBar behavior.
};

/** You shall add it before any SafeArea Provider. */
export const StatusBarProvider: React.FC<StatusBarProviderProps> = ({
  children, backgroundColor = '#fff',
}) => {
  // const colorR = useRef(backgroundColor).current
  const height = useSafeAreaInsets().top;
  return (<Context.Provider value={{}}>
    <StatusBar translucent backgroundColor='#0000'/>
    <View style={{ position: 'absolute', height, backgroundColor, width: '100%' }}/>
    {children}
  </Context.Provider>
  );
};

// export const useStatusBar = () => {
//   return useContext(StatusBarContext);
// };