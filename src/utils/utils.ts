export function getErrorMessage(err: any): string {
  const message = (typeof err === 'object' && err.message) ? err.message : err;
  return message ?? 'Error';
}