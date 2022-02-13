import { Alert } from 'react-native';


/** Error modal. For now it's just a wrapper for the Alert. */
export function mError(err: any): void {
  const header = 'Erro ' + typeof err === 'object' && err.code ? err.code : '';
  const message = typeof err === 'object' && err.message ? err.message : err;
  Alert.alert(header, message);
}