# Changelog

<!-- Template, # for major version, ## for minor and patch

# 1.0.0 (YYYY-MM-DD)
### Added
*
### Changed
*
### Fixed
*
-->

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
