<!-- <img src=".logo.png" alt=react-native-gev/><br/> -->

<div align="center">

[![npm](https://img.shields.io/npm/v/react-native-gev)](https://www.npmjs.com/package/react-native-gev)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![npm](https://img.shields.io/npm/dm/react-native-gev)](https://www.npmjs.com/package/react-native-gev)
</div>

# react-native-gev

<br/>

<div align="center">
  <h4>The smartest UI/DX kit for React Native!</h4>
  <h3> 🏗 ❗ Work In Progress ❗🛠 </h3>
</div>

<br/>



## This package is on dev stage. Don't use it yet. This readme is a draft.
> While it's already great, useful and being used on prod on two apps, constant breaking changes are still being made to achieve the best DX. I will keep making it more mature to avoid having legacy systems.

There are great known components libs like React Native Elements, React Native Paper... but there are always aspects on them that makes me not think they don't exactly fit my use cases.

This both improves some React Natives components like `View` and add many other useful components. They are all easily customizable and fast to catch up on how to use it.

This is opinionated. The objective of this is to allow me have a way greater productivity, so I can create more apps in a lower timeframe, and as long projects (>6m) are very tiring, and more apps = more money!

## Installation

```bash
expo install react-native-gev react-native-safe-area-context expo-status-bar react-native-reanimated @react-navigation/native @expo/vector-icons
```

> `react-native-safe-area-context` and `expo-status-bar` for StatusBar
>
> `react-native-reanimated` for TextInputOutline
>
> `@react-navigation/native` for useFocusEffect hook
>
> `@expo/vector-icons` for icons

## Philosophy
* Opinionated
* Quick and effortless to setup
* Expo is the future - and already the present!
* Quick to get your app done
* Developer Experience (DX) centered
* Combines the best libs
* Bleeding edge technologies, no legacy nonsenses
* Expo support (and suggested!)
* Simplifies and automates common patterns
* Easy customization
* Powerful and simple theming
* Follows [Semantic Versioning](https://semver.org/), breaking / UI changes are majors. (Not yet on v0), future proof


## Best practices

> Over the time I developed my own practices that aims to improve my DX. And they do!

* When defining a StyleSheet, call it `s` instead of calling it `styles`. Less useless letters, better readability and faster typing.
```
  <View s={s.container}/>
  ...
  const s = StyleSheet.create({...})
```

* When using our `<Text/>`, have `t` (`text`) as the last property, and `s` (`style`) before it. Faster to find out the text in this way.
```
  <Text anyOtherProp s={s.text} t='Hi, Earth!'/>
```

## Powered by:

```
react-native-mask-text
react-hook-forms
react-native-size-matters
react-native-shadow-2
pagescrollview
```

## Info
* The `/src` is intentionally shipped with the package. This ensures you will always have access to the source code for your installed version.
* Some patterns and components were based / built on top of others libs, so this has the best current practices. When they do, they have their source properly linked, with all the respect to the authors and to their licenses. This aims to improve them and make them fit better this project.
* We use Portals instead of native Modals. Modals have a good amount of issues and limitations. However, our mFunctions like mSnackbar etc have the m for Modal instead of p for Portal as pSnackbar wouldn't look too good. Maybe I will change it later?
* When there is another property that changes the component style, the `style` property has priority over it, if changing the same style property. (should it be the opposite of it? style as a reusable info, and props as a specific customization?)
* We use MaterialCommunityIcons as the default icons family. For `Button`'s `leftIcon` property, for example, we can pass `'email'` to use the corresponding MaterialCommunityIcons icon.
## TODO
* i18n maybe in Provider or via global state: `{currency: 'R$', decimalSeparator: ','}`

## Usage

## [Changelog](https://github.com/SrBrahma/react-native-gev/blob/main/CHANGELOG.md)