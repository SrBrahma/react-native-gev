import { useCallback, useRef } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';



type UsePreventCloseAppProps = {
  onBeforeCloseApp?: () => void;
  text?: string;
  timeout?: number;
};
export const usePreventCloseApp = (props?: UsePreventCloseAppProps): void => {
  const backPressedCount = useRef(0);
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const timeout = props?.timeout ?? 2000;
      if (backPressedCount.current === 0) {
        ToastAndroid.show(props?.text ?? 'Press again to exit', timeout);
        setTimeout(() => backPressedCount.current = 0, timeout);
        backPressedCount.current++;
      }
      else if (backPressedCount.current === 1) {
        props?.onBeforeCloseApp?.();
        BackHandler.exitApp();
      }
      return true;
    });
    return sub.remove;
  }, [props]));
};