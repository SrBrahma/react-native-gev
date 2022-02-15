import React, { useMemo } from 'react';
import type { FlatListProps, StyleProp, TextProps, TextStyle, ViewStyle } from 'react-native';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet, Text, View,
} from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RefreshControl, useTheme } from '../../main';
import type { SwitchProps } from '../Inputs/Switch';
import { Switch } from '../Inputs/Switch';



const Web = Platform.OS === 'web';

// Use this to avoid different scales.
const scale = 0.4;
const iconDefaultSize = Web ? 24 : moderateScale(24, scale);
const defaultPaddingLeft = Web ? 20 : moderateScale(22, scale);
const noIconExtraPadLeft = Web ? 18 : moderateScale(18, scale);
// const a = new MaterialCommunityIcons({})
type Icons = keyof typeof MaterialCommunityIcons.glyphMap;
type DividerType = undefined | boolean | 'full' | 'mid' | number;
type HideableItems = 'subtitle' | 'rightIcon' | 'switch';
type GreyableItems = 'title' | 'background';


const colors = {
  pretitle: '#869286',
  subtitle: '#777',
  title: '#111',
  icon: '#111',
  chevron: '#aaa',
  /** For android_ripple */
  onPress: '#0002',
  disabledBackground: '#eee6',
  greyTitle: '#666',
  divider: '#0004',
};


/** So we don't need to import the navigation type. */
type NavBase = { navigate: unknown }; // Unknown is better than any as it won't allow n() if navigation is undefined & invalid routes.

export type ItemListItemProps<Nav extends NavBase = NavBase> = ListItemProps & {
  /** If the item should not be rendered. Good for omitting stuf the user may not have access due to role limitation.
   * @default false */
  omit?: boolean;
  /** If the item should be rendered. Good for omitting stuf the user may not have access due to role limitation.
   * @default true */
  show?: boolean;
  /** If undefined, will use the Item title as key. */
  key?: string;
  /** On press, will navigate to this route. */
  onPressNav?: (n: Nav['navigate']) => void;
};


// TODO: Probably I can stop using the react-navigation import if I copy the types I need from it.
export type ListProps<Nav extends NavBase = NavBase> = {
  navigation?: Nav;
  /** Will add chevron for items when navTo prop is defined.
   * @default true */
  chevronOnNavTo?: boolean;
  items: ItemListItemProps<Nav>[];
  flatListProps?: FlatListProps<unknown>;

  refreshing?: boolean;
  onRefresh?: () => void;
  // divider // TODO
};

/** The backgroundColor defaults to the theme background color. */
export function List<Nav extends NavBase = NavBase>({
  items, navigation, chevronOnNavTo = true, flatListProps,
  refreshing, onRefresh,
}: ListProps<Nav>): JSX.Element {
  const theme = useTheme();
  return <FlatList
    refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing ?? false}/>}
    data={items}
    keyExtractor={(i) => (i.key ?? i.title ?? i.pretitle) as string}
    renderItem={({ item: i }) => {
      if (i.omit === true || i.show === false) return null;
      if (i.onPressNav && !navigation) throw new Error ('onPressNav is defined but navigation is not!');
      return <ListItem
        chevron={i.onPressNav && chevronOnNavTo}
        firstItemPadTop={i === 0}
        lastItemPadBottom={i === items.length - 1}
        {...(i.onPressNav && { onPress: () => navigation?.navigate && i.onPressNav?.(navigation.navigate) })}
        {...i}
      />;
    }}
    {...flatListProps as any as Record<string, never>} // typecast so it won't mess the FlatList generic type.
    style={[{ flexGrow: 1 }, flatListProps?.style]}
    bounces={false}
    overScrollMode='never'
    keyboardShouldPersistTaps='handled'
    contentContainerStyle={[{ flex: 1, backgroundColor: theme.colors.background }, flatListProps?.contentContainerStyle]}
  />;
}


export type ListItemProps = {
  pretitle?: string;
  pretitleStyle?: StyleProp<TextStyle>;
  pretitleProps?: TextProps;
  /** If should pad left by the icon size */
  blankLeftIcon?: number | boolean;
  /** If should pad right by the icon size */
  blankRightIcon?: number | boolean;
  topDivider?: DividerType;
  bottomDivider?: DividerType;
  firstItemPadTop?: boolean;
  lastItemPadBottom?: boolean;
  hideItemIfDisabled?: HideableItems | HideableItems[];
  hideItemIfEnabled?: HideableItems | HideableItems[];
  /** Removes default horizontal padding from the list item. */
  noHorizontalPadding?: boolean;
  /** If the list item is disabled, not clickable. */
  disabled?: boolean;
  /** What items should be grey'ed if the item is disabled */
  greyIfDisabled?: GreyableItems | GreyableItems[];
  /** Conditionally grey the title. greyIfDisabled will OR with this.*/
  greyTitle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  title?: string | React.ReactElement | number;
  titleProps?: TextProps;
  titleStyle?: StyleProp<TextStyle>;
  subtitle?: string | React.ReactElement | number;
  subtitleProps?: TextProps;
  subtitleStyle?: StyleProp<TextStyle>;
  chevron?: boolean;
  /** Will automatically, with React.cloneElement, apply our styles.
   *
   * If string, will use MaterialCommunityIcons. */
  leftIcon?: JSX.Element | Icons | false;
  leftComponent?: JSX.Element;
  /** Only used if leftIcon is a string. */
  leftIconStyle?: StyleProp<TextStyle>;
  /** Will automatically, with React.cloneElement, apply our styles.
   *
   * If string, will use MaterialCommunityIcons. */
  rightIcon?: JSX.Element | Icons | false;
  /** Only used if rightIcon is a string. */
  rightIconStyle?: StyleProp<TextStyle>;
  rightComponent?: JSX.Element;
  switch?: SwitchProps;
  onPress?: () => void;
};



export const ListItem: React.FC<ListItemProps> = (props) => {
  const theme = useTheme();

  const result = useMemo(() => {
    const {
      leftIcon: leftIconProp, rightIcon: rightIconProp,
      blankLeftIcon, blankRightIcon,
      leftIconStyle, rightIconStyle,
      chevron,
      bottomDivider, topDivider,
      containerStyle,
      noHorizontalPadding,
      firstItemPadTop, lastItemPadBottom,
      switch: switchProp, // cant use switch as it is a reserved word
      greyIfDisabled: greyIfDisabledProp,
      greyTitle,
      // hideItemIfDisabled: hideItemIfDisabledProp,
      // hideItemIfEnabled: hideItemIfEnabledProp,
      disabled,
      pretitle, pretitleStyle, pretitleProps,
      title, titleProps, titleStyle: titleStyleProp,
      subtitle, subtitleProps, subtitleStyle,
      onPress: onPressProp,
      leftComponent, rightComponent,
    } = props;

    const greyIfDisabled = (greyIfDisabledProp && !Array.isArray(greyIfDisabledProp))
      ? [greyIfDisabledProp]
      : greyIfDisabledProp;

    // const hideItemIfDisabled = (hideItemIfDisabledProp && !Array.isArray(hideItemIfDisabledProp))
    //   ? [hideItemIfDisabledProp]
    //   : hideItemIfDisabledProp;
    // const hideItemIfEnabled = (hideItemIfEnabledProp && !Array.isArray(hideItemIfEnabledProp))
    //   ? [hideItemIfEnabledProp]
    //   : hideItemIfEnabledProp;

    const left: JSX.Element | undefined = (() => {
      if (blankLeftIcon)
        return <MaterialCommunityIcons name='account' style={[s.leftIcon, s.blankIcon]}/>;
      if (leftIconProp) {
        if (typeof leftIconProp === 'string')
          return <MaterialCommunityIcons name={leftIconProp as any} style={[s.leftIcon, leftIconStyle]}/>;
        else
          return React.cloneElement(leftIconProp, { style: s.leftIcon });
      }
    })();

    const right: JSX.Element | undefined = (() => {
      if (blankRightIcon)
        return <MaterialCommunityIcons name='account' style={[s.rightIcon, s.blankIcon]}/>;
      if (rightIconProp) {
        if (typeof rightIconProp === 'string')
          return <MaterialCommunityIcons name={rightIconProp as any} style={[s.rightIcon, rightIconStyle]}/>;
        else
          return React.cloneElement(rightIconProp, { style: s.rightIcon });
      }
    })();

    /** To allow a right icon and then a chevron. */
    const right2 = chevron && <MaterialCommunityIcons name='chevron-right' style={s.chevron}/>;

    // Add an extra left padding when there is no left stuff (icon, component). Looks better!
    const extraLeftPadding = (left || leftComponent) ? 0 : noIconExtraPadLeft;

    function divider(divider: DividerType) {
      if (divider)
        return <View style={divider === 'full' ? s.dividerFull : s.divider}/>;
    }

    const titleStyle = StyleSheet.flatten([
      s.title,
      theme.fonts.medium,
      titleStyleProp,
      (greyTitle || (disabled && greyIfDisabled?.includes('title'))) && s.greyTitle,
    ]);

    const onPress = onPressProp
      ?? (switchProp ? (() => switchProp.onValueChange?.(!switchProp.value)) : null);

    return (<View style={containerStyle}>
      {divider(topDivider)}
      <Pressable
        disabled={!onPress}
        onPress={onPress}
        android_ripple={{ color: colors.onPress }}
        style={[
          { paddingLeft: defaultPaddingLeft + extraLeftPadding },
          s.content,
          firstItemPadTop && s.firstItemPadTop,
          lastItemPadBottom && s.lastItemPadBottom,
          disabled && greyIfDisabled?.includes('background') && s.backgroundDisabled,
          noHorizontalPadding && s.noHorizontalPadding,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftComponent}
          {left}
          <View style={s.textsView}>
            {pretitle !== undefined && <Text {...pretitleProps} style={[s.pretitle, pretitleStyle]}>{String(pretitle)}</Text>}
            {/* The titleStyle is composed above */}
            {title !== undefined && <Text {...titleProps} style={titleStyle}>{String(title)}</Text>}
            {subtitle !== undefined && <Text {...subtitleProps} style={[s.subtitle, subtitleStyle]}>{String(subtitle)}</Text>}
          </View>
          {right}
          {right2}
          {rightComponent}
          {switchProp && <Switch {...switchProp}/>}
        </View>
        {/* // FIXME: not allowing just switch without onPress.
        // Fix those conditionals or Maybe omit onValueChange and only allow onPress? <-
        // TODO my own switch
        {...switchProps && {
          switch: {
            disabled: rest.disabled ?? undefined, // for some reason rest.disabled may be null
            ...defaultSwitchProps(!!switchProps.value, !!rest.disabled),
            ...switchProps,
            // Add onPress to the onValueChange of switch
            ...(rest.onPress && { onValueChange: () => rest.onPress && rest.onPress(undefined as any) }),
          },
        }} */}
      </Pressable>
      {divider(bottomDivider)}
    </View>);
  }, [props, theme.fonts.medium]);

  return result;
};



const s = ScaledSheet.create({
  content: {
    paddingRight: Web ? 30 : moderateScale(22, scale),
    paddingVertical: Web ? 18 : moderateScale(22, scale),
  },
  firstItemPadTop: {
    paddingTop: Web ? 20 : moderateScale(24, 0.6), // 0.6 is ~ bigger in bigger screens and smaller on smaller.
  },
  lastItemPadBottom: {
    paddingBottom: Web ? 20 : moderateScale(24, 0.6),
  },
  dividerFull: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginRight: Web ? 30 : moderateScale(30, scale),
    marginLeft: Web ? 30 : moderateScale(36, scale),
  },
  backgroundDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  greyTitle: {
    color: colors.greyTitle,
  },
  noHorizontalPadding: {
    paddingHorizontal: 0, // Looks like ListItem uses this (edit: ? maybe when it used rn-elements)
    paddingLeft: undefined, // if 0, overriding paddingHorizontal wouldn't work
    paddingRight: undefined,
  },
  textsView: { // Contains pretitle, title, subtitle
    flexGrow: 1, // Use available space.
    flexShrink: 1, // Shrink internal texts if required, don't push right stuff away
    justifyContent: 'center',
    paddingRight: 10, // Don't touch right stuff like switches.
  },
  pretitle: {
    fontWeight: 'bold',
    color: colors.pretitle,
    fontSize: Web ? 18 : moderateScale(13.5, scale),
  },
  title: {
    color: colors.title,
    fontSize: Web ? 20 : moderateScale(15, scale),
  },
  subtitle: {
    color: colors.subtitle,
    fontSize: Web ? 15 : moderateScale(13.5, scale),
  },
  leftIcon: {
    color: colors.icon,
    fontSize: iconDefaultSize,
    marginRight: Web ? 18 : moderateScale(17, scale),
    // height: '100%', // was here. remove it if doesn't fix anything.
  },
  rightIcon: {
    color: colors.icon,
    fontSize: iconDefaultSize,
  },
  chevron: {
    color: colors.chevron,
    fontSize: iconDefaultSize - 4,
  },
  blankIcon: {
    color: '#0000',
  },
});