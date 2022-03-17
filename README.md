<!-- <img src=".logo.png" alt=react-native-gev/><br/> -->

<div align="center">

[![npm](https://img.shields.io/npm/v/react-native-gev)](https://www.npmjs.com/package/react-native-gev)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![npm](https://img.shields.io/npm/dw/react-native-gev)](https://www.npmjs.com/package/react-native-gev)
</div>

# react-native-gev

<br/>

<div align="center">
  <h4>The smartest UI/DX kit for React Native!</h4>
  <h3> 🏗 ❗ Work In Progress ❗🛠 </h3>
</div>

<br/>



## This package is on early dev stage. Don't use it yet. This readme is a draft.

There are great known components libs like React Native Elements, React Native Paper... but there are always aspects on them that makes me not think they don't exactly fit my use cases.

This both improves some React Natives components like `View` and add many other useful components. They are all easily customizable and fast to catch up on how to use it.

This is opinionated. The objective of this is to allow me have a way greater productivity, so I can create more apps in a lower timeframe, and as long projects (>6m) are very tiring, and more apps = more money!


#### It uses:

```
react-native-mask-text
react-hook-forms
react-native-size-matters
@expo/vector-icons
react-native-shadow-2
@react-navigation
pagescrollview
```


## Installation

### Expo
```
expo install react-native-gev react-native-safe-area-context react-native-reanimated
```


## Philosophy
* Opinionated
* Quick and effortless to setup
* Quick to get your app done
* Developer Experience (DX) centered
* Combines the best libs
* Bleeding edge technologies, no legacy nonsenses.
* Expo support (and suggested!)
* Simplifies and automates common patterns
* Easy customization
* Powerful theming
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


## Info
* The `/src` is intentionally shipped with the package. This ensures you will always have access to the source code for your installed version.
* Some patterns and components were based / built on top of others libs, so this has the best current practices. When they do, they have their source properly linked, with all the respect to the authors and to their licenses. This aims to improve them and make them fit better this project.


## TODO
* i18n maybe in Provider or via global state: `{currency: 'R$', decimalSeparator: ','}`

## Usage

## [Changelog](CHANGELOG.md)

## TODO add a builtin way to locally store data using another lib.
