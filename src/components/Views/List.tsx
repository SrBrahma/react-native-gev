import React, { useCallback, useMemo } from 'react';
import type { FlatListProps, ListRenderItemInfo, StyleProp, TextProps, TextStyle, ViewStyle } from 'react-native';
import {
  FlatList,
  Platform,
  StyleSheet,
} from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RefreshControl, useTheme } from '../../main';
import type { SwitchProps } from '../Inputs/Switch';
import { Switch } from '../Inputs/Switch';
import { Pressable } from '../Simple/Pressable';
import { Text } from '../Simple/Text';
import { View } from '../Simple/View';



const Web = Platform.OS === 'web';

// Use this to avoid different scales.
const scale = 0.4;
const iconDefaultSize = Web ? 24 : moderateScale(24, scale);
const defaultPaddingLeft = Web ? 20 : moderateScale(22, scale);
const noIconExtraPadLeft = Web ? 18 : moderateScale(18, scale);
// const a = new MaterialCommunityIcons({})
type Icons = keyof typeof MaterialCommunityIcons.glyphMap;
/** If `true`, defaults to 'mid'. If falsy, it isn't shown. */
type SeparatorType = boolean | 'full' | 'mid';
type HideableItems = 'subtitle' | 'rightIcon' | 'switch';
type GreyableItems = 'title' | 'background';


const listColors = {
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
  flatListProps?: Partial<FlatListProps<unknown>>;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** @default 'mid' */
  separator?: SeparatorType;
  /** By default, it uses item.key, then item.title then item.subtitle. */
  keyExtractor?: ((item: ItemListItemProps<Nav>, index: number) => string) | undefined;
};

function defaultKeyExtractor(i: ItemListItemProps): string {
  return (i.key ?? i.title ?? i.pretitle) as string;
}

/** The backgroundColor defaults to the theme background color. */
export function List<Nav extends NavBase = NavBase>({
  items, navigation, chevronOnNavTo = true, flatListProps,
  refreshing, onRefresh,
  keyExtractor,
  separator = 'mid',
}: ListProps<Nav>): JSX.Element {
  const theme = useTheme();

  const renderItem = useCallback(({ index, item: i }: ListRenderItemInfo<ItemListItemProps<Nav>>) => {
    // FIXME if omit and first item, the next item that will so be the first, won't have firstItemPadTop as index is 1.
    if (i.omit === true || i.show === false) return null;
    if (i.onPressNav && !navigation) throw new Error ('onPressNav is defined but navigation is not!');
    return <ListItem
      chevron={i.onPressNav && chevronOnNavTo}
      firstItemPadTop={index === 0}
      lastItemPadBottom={index === items.length - 1}
      {...(i.onPressNav && { onPress: () => navigation?.navigate && i.onPressNav?.(navigation.navigate) })}
      topSeparator={index > 0 && separator}
      {...i}
    />;
  }, [chevronOnNavTo, items.length, navigation, separator]);

  const contentContainerStyle = useMemo(() => StyleSheet.flatten([
    { flexGrow: 1, backgroundColor: theme.colors.background }, flatListProps?.contentContainerStyle,
  ],
  ), [flatListProps?.contentContainerStyle, theme.colors.background]);

  const result = useMemo(() => {
    return <FlatList
      refreshControl={onRefresh ? <RefreshControl onRefresh={onRefresh} refreshing={refreshing ?? false}/> : undefined}
      data={items}
      keyExtractor={keyExtractor ?? defaultKeyExtractor}
      renderItem={renderItem}
      {...flatListProps as any as Record<string, never>} // typecast so it won't mess the FlatList generic type.
      bounces={false}
      overScrollMode='never'
      keyboardShouldPersistTaps='handled'
      contentContainerStyle={contentContainerStyle}
    />;
  }, [contentContainerStyle, flatListProps, items, keyExtractor, onRefresh, refreshing, renderItem]);

  return result;
}



function separator(divider?: SeparatorType): JSX.Element | null {
  return divider
    ? <View s={divider === 'full' ? s.dividerFull : s.divider}/>
    : null;
}


export type ListItemProps = {
  pretitle?: string;
  pretitleStyle?: StyleProp<TextStyle>;
  pretitleProps?: TextProps;
  /** If should pad left by the icon size */
  blankLeftIcon?: number | boolean;
  /** If should pad right by the icon size */
  blankRightIcon?: number | boolean;
  topSeparator?: SeparatorType;
  bottomSeparator?: SeparatorType;
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
  /** Style of the View that wrapps all (Pressable and Separators). Useful for margins. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style of the Pressable. Useful for paddings. */
  contentStyle?: StyleProp<ViewStyle>;
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
  // TODO: Could we also wrap it with React.memo?
  const result = useMemo(() => {
    const {
      leftIcon: leftIconProp, rightIcon: rightIconProp,
      blankLeftIcon, blankRightIcon,
      leftIconStyle, rightIconStyle,
      chevron,
      bottomSeparator, topSeparator,
      containerStyle, contentStyle,
      noHorizontalPadding,
      firstItemPadTop, lastItemPadBottom,
      switch: switchProp, // cant use switch as it is a reserved word
      greyIfDisabled: greyIfDisabledProp,
      greyTitle,
      disabled,
      pretitle, pretitleProps, pretitleStyle: pretitleStyleProp,
      title, titleProps, titleStyle: titleStyleProp,
      subtitle, subtitleProps, subtitleStyle: subtitleStyleProp,
      onPress: onPressProp,
      leftComponent, rightComponent,
    } = props;

    const { fonts, colors } = theme;

    const greyIfDisabled = (greyIfDisabledProp && !Array.isArray(greyIfDisabledProp))
      ? [greyIfDisabledProp]
      : greyIfDisabledProp;

    const left: JSX.Element | undefined = (() => {
      if (blankLeftIcon)
        return <MaterialCommunityIcons name='account' style={[s.leftIcon, s.blankIcon]}/>;
      if (leftIconProp) {
        if (typeof leftIconProp === 'string')
          return <MaterialCommunityIcons name={leftIconProp as any} style={[s.leftIcon, { color: colors._list.icon }, leftIconStyle]}/>;
        else
          return React.cloneElement(leftIconProp, { style: [s.leftIcon, { color: colors._list.icon }, leftIconStyle] });
      }
    })();

    const right: JSX.Element | undefined = (() => {
      if (blankRightIcon)
        return <MaterialCommunityIcons name='account' style={[s.rightIcon, s.blankIcon]}/>;
      if (rightIconProp) {
        if (typeof rightIconProp === 'string')
          return <MaterialCommunityIcons name={rightIconProp as any} style={[s.rightIcon, { color: colors._list.icon }, rightIconStyle]}/>;
        else
          return React.cloneElement(rightIconProp, { style: s.rightIcon });
      }
    })();

    /** To allow a right icon and then a chevron. */
    const right2 = chevron && <MaterialCommunityIcons name='chevron-right' style={s.chevron}/>;

    const onPress = onPressProp
    ?? (switchProp ? (() => switchProp.onValueChange?.(!switchProp.value)) : null);

    // Add an extra left padding when there is no left stuff (icon, component). Looks better!
    const extraLeftPadding = (left || leftComponent) ? 0 : noIconExtraPadLeft;

    const pressableStyle = StyleSheet.flatten<ViewStyle>([ // error without explicit generic
      { paddingLeft: defaultPaddingLeft + extraLeftPadding },
      s.content,
      firstItemPadTop && s.firstItemPadTop,
      lastItemPadBottom && s.lastItemPadBottom,
      disabled && greyIfDisabled?.includes('background') && s.backgroundDisabled,
      noHorizontalPadding && s.noHorizontalPadding,
      contentStyle,
    ]);
    const pretitleStyle = StyleSheet.flatten([
      s.pretitle,
      { color: colors._list.pretitle },
      fonts.bold,
      pretitleStyleProp,
    ]);
    const titleStyle = StyleSheet.flatten([
      s.title,
      fonts.medium,
      { color: colors._list.title },
      titleStyleProp,
      (greyTitle || (disabled && greyIfDisabled?.includes('title'))) && s.greyTitle,
    ]);
    const subtitleStyle = StyleSheet.flatten([
      s.subtitle,
      // fonts.regular, // already added to our Text component
      { color: colors._list.subtitle },
      subtitleStyleProp,
    ]);

    return (
      <View s={containerStyle}>
        {separator(topSeparator)}
        <Pressable
          disabled={!onPress}
          onPress={onPress}
          android_ripple={{ color: listColors.onPress }}
          s={pressableStyle}
        >
          <View row align>
            {leftComponent}
            {left}
            <View s={s.textsView}>
              {pretitle !== undefined && <Text {...pretitleProps} s={pretitleStyle} t={String(pretitle)}/>}
              {/* The titleStyle is composed above */}
              {title !== undefined && <Text {...titleProps} s={titleStyle} t={String(title)}/>}
              {subtitle !== undefined && <Text {...subtitleProps} s={subtitleStyle} t={String(subtitle)}/>}
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
        {separator(bottomSeparator)}
      </View>
    );
  }, [props, theme]);

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
    backgroundColor: listColors.divider,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: listColors.divider,
    marginRight: Web ? 30 : moderateScale(30, scale),
    marginLeft: Web ? 30 : moderateScale(36, scale),
  },
  backgroundDisabled: {
    backgroundColor: listColors.disabledBackground,
  },
  greyTitle: {
    color: listColors.greyTitle,
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
    paddingRight: 14, // Don't touch right stuff like switches.
  },
  pretitle: {
    fontSize: Web ? 18 : moderateScale(13.5, scale),
    flexWrap: 'wrap',
  },
  title: {
    fontSize: Web ? 20 : moderateScale(15, scale),
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: Web ? 15 : moderateScale(13.5, scale),
    flexWrap: 'wrap',
  },
  leftIcon: {
    fontSize: iconDefaultSize,
    marginRight: Web ? 18 : moderateScale(17, scale),
  },
  rightIcon: {
    fontSize: iconDefaultSize,
  },
  chevron: {
    color: listColors.chevron,
    fontSize: iconDefaultSize - 4,
  },
  blankIcon: {
    color: '#0000',
  },
});