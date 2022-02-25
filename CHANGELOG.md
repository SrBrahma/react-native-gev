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

Changelog won't be updated frequently at the current dev stage.

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

# Ok I think I can already start to fill this changelog

## 0.5.0 - 2022-02-07
* Added `component`, `containerStyle` and `errorStyle` props to `TextInput`
* Now some theme's colors defaults to another colors. `_button.destructive` for example defaults to `error` color.

## 0.4.0 - 2022-02-07
* Added useForm.

## 0.1.0 - 2022-02-03)
* Project started
