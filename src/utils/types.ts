/** Makes the given properties optional.
 *
 * https://stackoverflow.com/a/54178819 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/** https://stackoverflow.com/a/69328045 */
export type RequiredBy<T, K extends keyof T> = T & { [P in K]-?: T[P] };