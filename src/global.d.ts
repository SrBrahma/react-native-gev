// https://stackoverflow.com/a/69944521/10247962
declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}