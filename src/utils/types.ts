/** Makes the given properties optional.
 *
 * https://stackoverflow.com/a/54178819/10247962 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;