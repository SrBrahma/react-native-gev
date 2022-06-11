# Changelog

## 0.53.0
* Added `mTextInput` and `mTextInputBottom`.
* Removed `TextInputOutline`'s containerStyle's `flex: 1`.
* Moved from `color` package to `colord`.

## 0.52.3
* Added `debounceMs` to Uncontrolled `Switch`.

## 0.52.2
* Improved `TextInputOutline` errorText and counterText positioning and marginBottom reduced by 2.

## 0.52.1 - 2022-06-04
* Added `shouldUnregister` to `TextInput`
* Added `| number` to `TextInput`'s `defaultValue` property.

## 0.52.0 - 2022-06-04
* Added `defaultValue` to `TextInput`.
* Added `nonNegativeInteger` as preset to `TextInput`.

## 0.51.0
* Added `Validations` to exports.

## 0.50.0
* Added `getControl` to `useForm`.
* Added `label` and `subLabel` to `TextInput` and themeing.
* Added event to `Button`'s `onPress`.

## 0.49.x
* Unpublished.

## 0.48.0
* Added `grow` and `shrink` properties to `View`.
* Added `align`, `alignVertical` and `center` properties to `Text`.

## 0.47.0
* Removed default style of `PortalView`'s `contentStyle` (`{padding: 5}`).
* Added `Body` property to `PortalView` as an alias to `children`.

## 0.46.0
> Run the new Readme's installation command to install the now peerDependencies.

* Removed TextInput's legacy 'country.br.cpf' preset.
* `expo-image-picker`, `expo-image-picker`, `@react-navigation/native`, `@expo/vector-icons` and `expo-status-bar` are now a peerDependency.
* Now exporting from index the `TextInputPreset` type.
* Fixed `PortalBottomView` having a `borderBottomLeftRadius: 9` instead of 0.

## 0.45.9
* Fixed `List` scroll.

## 0.45.8
* Added `keyExtractor` to `List`.

## 0.45.7
* Added memoization to `TextInputFormal`.
* Fixed Controlled components `id` prop.

## 0.45.6
* Fixed `Portal` "Cant perform a React state update on an unmounted component" warn on unmount.

## 0.45.5
* Fixed `Button` crashing app when there aren't shadow radii and hasShadow=false.

## 0.45.2~4 - 2022-04-01
* Added: `visible` prop to `Portal`.
* Renamed: `viewStyle` of `Portal` to `style`
* Renamed: `onCancel` of `PortalView` to `onRequestClose`.

## 0.45.1 - 2022-03-30
* Fixed `TextInput`: id prop was overwriting label prop.
* Changed `Button`: Removed ripple when disabled.
* Added memoization to `View`, `Text` and `Pressable`.

## 0.45.0
* Added `separator` property to `List`.
* Renamed: `ListItem` `topDivider` and `bottomDivider` to `topSeparator` and `bottomSeparator`. Separator is the name used in FlatList for dividers.
* Change: `ListItem` increased texts padding right from `10` to `14`.
* Fix: `ListProps[flatListProps]` is now Partial.

## 0.44.2
* `Pressable` default ripple from `'#0000000d' : '#ffffff14'` to `'#00000010' : '#ffffff20'`.

## 0.44.1
* Fixed controlled inputs `id` property type for newer react-hook-form version

## 0.44.0
* Upgraded `react-native-form` to 7.28.1
* `react-native-form` is now a peerDep, as you may want to use other functionalities of it without involving gev.
* `StatusBarProvider` `backgroundColor` type from `string` to `ColorValue`
* `TextInputOutline`: Removed `alignSelf: 'stretch'` from `containerStyle` default.

## 0.43.0
* Changed `Button`'s `'outline' type`: It's now painted.
* Added to `Button`: `'outlineClear'` as a new `type`. It's the same as the previous `'outline'`

## 0.42.5
* Changed `TextInput` when `type === 'outline'`: `style.borderColor` may be overwritten.
* Changed `Button`: `!hasShadow` has priority over `shadowProps`.

## 0.42.4
* Changed `TextInput`'s `const label = labelProp ?? idToLabel?.[id] ?? id;` to `labelProp ?? idToLabel ? (idToLabel?.[id] ?? id) : undefined;`

## 0.42.3
* Changed `Button` textStyle default `paddingTop` to `top`.

## 0.42.2
* Fixed `Button`'s `textStyle`'s `textAlignVertical` defaulting to `'bottom'` instead of `'center'`.

## 0.42.1
* Fixed `FlatList` generic type.

## 0.42.0
* Added `floating` property to `Loading`.
* Added `{ cancelable: true }` to Alert.alert in mError.

## 0.41.1
* Fixed `PageScrollView` backgroundColor property.

## 0.41.0
* Trying out `pagescrollview@2.0.0-beta.0.`.

## 0.40.1
* Changed `useGetThemeDefaultProps`: It no longer uses useMemo on it. If our component defaultProp is a hook, it would complain hooks can't be inside useMemo().
* Changed `PortalBottomView`: Now zeroes bottomLeft and Right radii instead of zeroing borderRadius and setting topLeft and Right.

## 0.40.0
* Renamed `ModalView` to `PortalView` (and its params prop).
* Renamed `ModalBottomView` to `PortalBottomView` (and its params prop).

## 0.39.0
* Reworked `theme.sizes`:
* * react-native-gev components no longer uses it (but maybe ModalView should use it?), so you are now totally free to change it and set it up to suit your application needs and styles.
* * Changed the old ~`theme.sizes.borderRadiusSmall` style to `theme.sizes.small.borderRadius`. Cleaner, more meaningful and prettier. Less garbage.

Nice! :) Spent some hours trying to get this result, which is probably the best way to have a centralized styles control.

## 0.38.5
* Renamed Theme's `sizes.roundness` to `sizes.borderRadius`.

## 0.38.4
* Added `color` and `style` properties to `Loading`.
* Changed `flex` property of View-based components - now it can be false.

## 0.38.3
* `Pressable` ripple is now more subtle. Changed from `'#00000014' : '#ffffff2f'` to `'#0000000d' : '#ffffff14'`
## 0.38.2
* `Pressable` automatic ripple is now only applied when onPress is defined.

## 0.38.1 - 2022-03-16
* `Portal` can now accept multiple children.
* Now exporting `PortalProps`.

## 0.38.0 - 2022-03-15
* Renamed `ModalsAndPortals` to `PortalsAndModals`. Portals! 😍
* Renamed `addPortal` to `addToPortalsAndModals`.
* Renamed `removePortal` to `removeFromPortalsAndModals`.
* Removed `askPortalMetaRemoval`.
* Renamed `addPortalMeta` to `addPortal`.
* Renamed `removePortalMeta` to `removePortal`.
* `removePortal` now has a second parameter, the `mode`. It can be either 'now' or 'animation' (default). 'animation' have the same behavior of the removed `askPortalMetaRemoval`, 'now' keeps its old behavior.
* Readded `"react-native-svg": "*"` to peerDeps.

## 0.37.4
* Added missing Portal Meta functions.

## 0.37.2~3
* ~`react-native-svg` is now a peer dep. If we had different versions we would have errors.~
* Removed `react-native-svg`. We don't actually use this (but is required by `react-native-shadow-2`).

## 0.37.1
* Fixed `floatPrice` preset.

## 0.37.0
* Added `type` and `outlineWidth` to `Button`.

## 0.36.0
* Added `TextInput` `'floatPrice'` preset.

## 0.35.0
* If a prop in `theme.props` is a function, it now receives the component props as argument.

## 0.34.0
* Added `smartHandleSubmit` to useForm.

## 0.33.0
* `Snackbar` `onDismiss` renamed to `onTimeout`.
* Added `mSnackbar`.

## 0.32.0
* Added `FlatList`.
* Upgraded dependencies.
* Chore: Moved simple components wrapper as `View`, `Pressable`, `Text` to `Simple` dir.

## 0.31.0
* Refactored `ModalView` and `ModalBottomView`. `ModalView` still used actual Modal instead of Portal, and `ModalBottomView` is now using `ModalView`.

## 0.30.1
* Added `style` property to StatusBarProvider

## 0.30.0
* Added `flex` property to View-like components.

## 0.29.0
* `StatusBarProvider` no longer has absolute positioning, it was causing a movement in vertical positioning in 1st->2nd render.
* Refactored `ModalBottomView`.

## 0.28.4
* `align` property of `View`-like components can now be true, defaulting to `'center'`.

## 0.28.3
* Fixed PressableProps. Some props like hitSlop were ViewProps['hitSlop'] & PressableProps['hitSlop'], resulting in unusable or wrong types.

## 0.28.2
* Fixed ~`createTheme({x: {fonts: { y }}})` y Intellisense/autocomplete.

## 0.28.1
* `ListItem` subtitle now using theme.fonts.bold

## 0.28.0
* Added theme for List's `icon`, `title`, `pretitle`, `subtitle`. Later more to come.

## 0.27.3
* Changed theme's default `disabled` from '#dadada' to '#dbdbdb'. Noticeable!

## 0.27.2
* Fixed `List` firstItemPadTop not being applied.

## 0.27.1
* Fixed `TextInput` mask for `maskType='currency'`

## 0.27.0
* Renamed `ScrollPicker` to `WheelPicker`.
* Now exporting `limitWheelIndex()`

## 0.26.0
* Added `integerPrice` preset to TextInput

## 0.25.9~10
* Fixed TextInput `logicalToUnmasked` preset prop.

## 0.25.3~8
#### Button
* Added `'flex-start' | 'flex-end' | 'center' | 'baseline'` types to `shrink` property.
* Horizontal padding moved from text to pressable, and added paddingRight to iconContainer.

## 0.25.2
* `quality` to useImagePicker()

## 0.25.1
* Fixed `View` and `Pressable` without children

## 0.25.0
* Added `Pressable`
* Added `getErrorMessage`.

## 0.24.2
* Removed `aspectRatio: 1` from `Button`'s `iconContainer` default style.

## 0.24.1
* Fixed `Button` icon color

## 0.24.0
* Removed `stretch` and `stretchRow` from `Button`
* Added `shrink` and `row` to `Button`

## 0.23.0
* Removed `Row`
* Added `View`, with `row`, `justify`, and other utils props.
* Added `textProps` to `Button`

## 0.22.0
### useImagePicker
* Added `base64` mode.
* Renamed `pickedImage` to `isImagePicked`
* `pickImage` can now upload right after picking the image.
* `pickImage` can now throw errors instead of alert()'ing.

## 0.21.1
* Fixed useImagePicker opts being required

## 0.21.0
* Added `t` as alias to `text` to `Button`
* Added `s` as alias to `style` to `Row`

## 0.20.0
* Added `base64` option to `useImagePicker`

## 0.19.0
* Added `JustifyContent` props to `Row`

## 0.18.0
* Added `Row` component

## 0.17.5~6
* Fixed snackbar text

## 0.17.4
* Added View wrapping TextInputFormal rightComponent
* Fixed default TextInputFormal `contentStyle` not working

## 0.17.3
* Moved some TextInputFormal's styles of `style` to `contentStyle`

## 0.17.2
* Added `contentStyle` to TextInput.

## 0.17.1
* Fixed PageScrollView theme's background color overwriting user viewStyle.backgroundColor.

## 0.17.0
* Renamed theme's `props` to `defaultProps`.
* Each component `defaultProps` can now be a function, that will be run as a hook.

## 0.16.0~6
* Added `props` prop to theme. Currently `TextInput` and `Button` but more to come. This allow easier customization of the components.
* Fixed `Snackbar` being empty on fade out animation when `visible={!!text}`.

## 0.15.0~1
* Added `Button` automatic ripple color based on bg brightness.
* Fixed `Button` ripple overflow.

# Older changelogs weren't always being reported due to the high number of updates.

## 0.14.5
* Added `shadowProps` to `Button`

## 0.14.3
* Added `uppercase` prop to `Button`

## 0.14.0~2
* Added `ImageBackground`, wrapper for the RN component of same name.

## 0.13.8
* Fixed `color` lib version, as v4 don't work on unsupported envs like Expo.

## 0.13.0
* Added `Switch` to useForm's `components` prop.

## 0.5.0 - 2022-02-07
* Added `component`, `containerStyle` and `errorStyle` props to `TextInput`
* Now some theme's colors defaults to another colors. `_button.destructive` for example defaults to `error` color.

## 0.4.0 - 2022-02-07
* Added useForm.

## 0.1.0 - 2022-02-03)
* Project started
