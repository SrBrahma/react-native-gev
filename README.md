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



## This readme is a draft.
> While it's already great, useful and being used on prod on two apps, constant breaking changes are still being made to achieve the best DX. I will keep making it more mature to avoid having legacy systems.

There are great known components libs like React Native Elements, React Native Paper... but there are always aspects on them that makes me not think they don't exactly fit my use cases.

This both improves some React Natives components like `View` and add many other useful components. They are all easily customizable and fast to catch up on how to use it.

Along components, this package adds some very useful, simple and intuitive shortcuts to usual components.

This is opinionated and it's being conceptualized and developed for a long time. This provides a way greater productivity and joy during development.

* Why we write hundreds of `style`s in Views when we can only type a single `s`? This is really quick to catch up and improves readability and productivity when we are talking about months of work.

* Why to have a `<Text>My Text</Text>` when we can have only `<Text t='My Text'/>`?

It also adds some common components:

* A powerful TextInput, with great ready to use integration to `react-hook-form`. Has some very useful presets for common data input.
* A really beautiful, validated and customizable `List` component with `react-navigation` integration, allowing simple navigation with a `onPressNav: (n) => n('Profile')`. It automatically adds a chevron when this is set! Also has a very useful `switch` property, to use our `Switch`!
* A Switch that also ready to be used with `react-hook-form` and integrated debounce functionality for sync and async callbacks.
* A ready to use `Button` that sets a fullscreen loading if the onPress returns a Promise. It also will sets Alert.alert() with the reject message.


Themeing:
* `RefreshControl` uses the primary color. There is also a convenient `FlatList` that uses this RefreshControl.
* [To be written]

## Installation

```bash
expo install react-native-gev react-hook-form react-native-safe-area-context expo-status-bar react-native-reanimated @react-navigation/native @expo/vector-icons
```

> `react-native-safe-area-context` and `expo-status-bar` for StatusBar
>
> `react-native-reanimated` for TextInputOutline
>
> `@react-navigation/native` for useFocusEffect hook
>
> `@expo/vector-icons` for icons


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

* [react-hook-forms](https://github.com/react-hook-form/react-hook-form)
* [react-native-shadow-2](https://github.com/SrBrahma/react-native-shadow-2)
* [react-native-mask-text](https://github.com/akinncar/react-native-mask-text)
* [react-native-size-matters](https://github.com/nirsky/react-native-size-matters)
* [pagescrollview](https://github.com/SrBrahma/pagescrollview)


## Alternatives

* **react-native-paper** - Some components here such as `Snackbar` were built on top of it! It's a popular package but I just don't like most of it.
* **react-native-elements** - I have used it a bit on the past. The `List` for example was a wrapper to their List, but it had so many customizations and limitations that I decided to made my own. It's also a good package but don't satisfy my needs.
* **Tailwind** - While Tailwind is useful, it just isn't typesafe and Intellisense'able. I don't like how its styling is done.

## Info
* The `/src` is shipped with the package. This ensures the access to the source code.
* Some patterns and components were based / built on top of others libs, so we have the best practices. When they do, they have their source properly linked, with all the respect to the authors and to their licenses. This aims to improve them and make them fit better this project.
* We use Portals instead of native Modals. Modals have a good amount of issues and limitations. However, our mFunctions like mSnackbar etc have the m for Modal instead of p for Portal as pSnackbar wouldn't look too good.
* When the component has properties that changes the component's style, they have priority over the styles property, to allow individual customization.
* We use MaterialCommunityIcons as the default icons family. For `Button`'s `leftIcon` property, for example, we can pass `'email'` to use the corresponding MaterialCommunityIcons icon.
## TODO
* i18n maybe in Provider or via global state: `{currency: 'R$', decimalSeparator: ','}`

## Usage

## [Changelog](https://github.com/SrBrahma/react-native-gev/blob/main/CHANGELOG.md)
