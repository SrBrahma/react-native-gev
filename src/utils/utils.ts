/** Returns the error.message if error isn't null. Fallbacks to `error` and then fallback=`"Error"` */
export function getErrorMessage(err: any, fallback: string = 'Error'): string {
  return ((typeof err === 'object' && err.message) ? err.message : err) || fallback;
}