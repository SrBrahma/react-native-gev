import { ToastAndroid } from 'react-native';



export type SnackbarOptions = {
  /** @default 2000 */
  timeout: number;
};

export function Snackbar(message: string, opts?: SnackbarOptions): void {
  const {
    timeout = 2000,
  } = opts ?? {};

  // TODO
  ToastAndroid.show(message, timeout);
}