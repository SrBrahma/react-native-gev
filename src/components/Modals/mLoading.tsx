import is from '@sindresorhus/is';
import { Loading } from '../Others/Loading';
import { mError } from './mError';
import { addPortalMeta, askPortalMetaRemoval } from './ModalBase';



export type OnModalLoadingError = 'modal' | 'snackbar' | 'none';

/** Loading Modal. Won't throw errors unless throw: true, so you can `void mLoading`. */
export async function mLoading<T extends void | any | Promise<any>>(param: (T | (() => T)), opts: {
  // There used to be a onSuccess and onError. Just use .catch and .then or await.
  /** If it shall throw/rethrow on error. Won't remove the Alert.
   * @default false */
  mayThrow?: boolean;
  /** @default 'modal' */
  onError?: OnModalLoadingError;
  /** It doesn't return anything because errors aren't thrown by default. */
} = { mayThrow: false, onError: 'modal' }): Promise<void> { // Maybe could return {success: Awaited<T>, error: any}, but maybe it was making this too complex.
  try {
    const possiblePromise: T = typeof param === 'function' ? (param as () => T)() : param;
    // Only add modal if it's a promise. We do this to avoid nav bar colorization even if not a promise.
    if (is.promise(possiblePromise)) {
      // By entering the key, it will only add one Portal.
      const key = addPortalMeta(<Loading fullscreen/>);
      try {
        await possiblePromise;
      } finally {
        askPortalMetaRemoval(key);
      }
    }
  } catch (err) {
    switch (opts.onError) {
      case 'modal': mError(err);
      // case 'snackbar': typeof err === 'object' && err.message ? err.message : err;
    }
    if (opts.mayThrow)
      throw (err);
  }
}