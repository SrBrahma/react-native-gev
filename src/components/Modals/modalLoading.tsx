import is from '@sindresorhus/is';
import { Loading } from '../Others/Loading';
import { addModalOrPortal, removeModalOrPortal } from './ModalBase';
import { modalError } from './modalError';


/** Won't throw errors (unless throw: true), you may `void modalLoading`. */
export async function modalLoading<T extends(void | any | Promise<any>)>(param: (T | (() => T)), opts: {
  // There used to be a onSuccess and onError. Just use .catch and .then or await.
  /** If it shall throw/rethrow on error. Won't remove the Alert.
   * @default false */
  mayThrow?: boolean;
  /** It doesn't return anything because errors aren't thrown by default. */
} = {}): Promise<void> { // Maybe could return {success: Awaited<T>, error: any}, but maybe it was making this too complex.
  const component = () => <Loading fullscreen/>;

  try {
    const possiblePromise: T = typeof param === 'function' ? (param as () => T)() : param;
    // Only add modal if it's a promise. We do this to avoid nav bar colorization even if not a promise.
    if (is.promise(possiblePromise)) {
      addModalOrPortal(component);
      await possiblePromise;
      removeModalOrPortal(component);
    }
  } catch (err) {
    removeModalOrPortal(component); // no prob to run if not a promise
    modalError(err);
    if (opts.mayThrow)
      throw (err);
  }
}