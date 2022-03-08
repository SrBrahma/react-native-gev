import { useState } from 'react';
import type { OmitKey, Optional } from '../../internalUtils/types';
import type { SnackbarProps } from '../Others/Snackbar';
import { Snackbar } from '../Others/Snackbar';
import { addPortal, removePortal } from './ModalBase';



export type ModalSnackbarProps = Optional<OmitKey<SnackbarProps, 'visible'>, 'onTimeout'>;

function ModalSnackbar(p: ModalSnackbarProps): JSX.Element {
  const [visible, setVisible] = useState(true);
  return (
    <Snackbar {...p} visible={visible} onTimeout={setVisible}/>
  );
}
export function mSnackbar(p: ModalSnackbarProps): void {
  let key = '';
  const remove = () => removePortal(key);
  key = addPortal(<ModalSnackbar {...p} onDisappear={() => { remove(); p.onDisappear?.(); }}/>);
}