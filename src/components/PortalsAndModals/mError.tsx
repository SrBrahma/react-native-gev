import { Alert } from 'react-native';
import { getErrorMessage } from '../../utils/utils';


/** Error modal. For now it's just a wrapper for the Alert. */
export function mError(err: any): void {
  const header = 'Erro ' + typeof err === 'object' && err.code ? err.code : '';
  const message = getErrorMessage(err, '');
  Alert.alert(header, message, undefined, { cancelable: true });
}