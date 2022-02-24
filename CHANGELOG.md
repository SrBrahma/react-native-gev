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
