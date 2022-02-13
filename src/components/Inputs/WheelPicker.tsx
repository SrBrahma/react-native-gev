// Based on https://github.com/rheng001/react-native-wheel-scrollview-picker but heavily changed.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewProps, ViewStyle } from 'react-native';
import {
  Dimensions, Platform,
  Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';



function isNumeric(str: string | unknown): boolean {
  if (typeof str === 'number') return true;
  if (typeof str !== 'string') return false;
  return (
    !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

const deviceWidth = Dimensions.get('window').width;

const isViewStyle = (style: ViewProps['style']): style is ViewStyle => {
  return (
    typeof style === 'object' &&
    style !== null &&
    Object.keys(style).includes('height')
  );
};

export type ScrollPickerProps<T = unknown> = {
  /** @default [] */
  data?: T[];
  /** Style of the wrapping view. You may use this to set the backgroundColor. */
  containerStyle?: StyleProp<ViewStyle>;
  style?: ViewProps['style']; // TODO rework this
  selectedIndex?: number;
  onValueChange?: (p: {value: T; index: number}) => void;
  // itemToText?: ({item: T, index: number}) => string;
  // itemTextStyle?: StyleProp<TextStyle>;
  // selectedItemTextStyle?: StyleProp<TextStyle>;
  /** @default (distance) => Math.max(0.3, 1 - (distance * 3 / 10)) */
  // itemOpacity?: false | (p: {item: T, index: number, distance: number}) => string
  renderItem?: (p: {
    item: T; index: number; isSelected: boolean;
    /** The index difference between the item and the selected one. Useful to give the item some transparency. Won't be negative. */
    distance: number;}) => JSX.Element;
  /** @default index */
  keyExtractor?: (p: {item: T; index: number}) => React.Key;
  /** The color for the horizontal lines above and below the center.
   *
   * Won't render if falsy.
   * @default false */
  highlightColor?: string | false;
  /** @default 30 */
  itemHeight?: number;
  /** The height of the container. Fallbacks to containerStyleHeight, then to itemHeight * 5. */
  containerHeight?: number;
  /** If false, onValueChange is only called when the scroll is no longer being dragged.
   *
   * If true, every value change while dragging triggers onValueChange.
   * @default true */
  changeValueWhileDragging?: boolean;
};

/** Limits the index between 0 and data.length - 1. */
function constrainIndex(index: number | undefined, dataLength: number) {
  return Math.max(0, Math.min(index ?? 0, dataLength - 1));
}

const isIos = Platform.OS === 'ios';

export function ScrollPicker<T>({
  itemHeight = 30, data = [], highlightColor = false,
  changeValueWhileDragging = true, onValueChange, selectedIndex: selectedIndexProp, ...p
}: ScrollPickerProps<T>): JSX.Element {

  const [_selectedIndex, setSelectedIndex] = useState(constrainIndex(selectedIndexProp, data.length));
  const scrollRef = useRef<ScrollView>(null);
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const [isOnMomentum, setIsOnMomentum] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isScrollingTo, setIsScrollingTo] = useState(false);
  const [isIosScrollingTo, setIsIosScrollingTo] = useState(false);


  const scrollToIndex = useCallback(({ index, animated, setState }: {index: number; animated: boolean;
    /** If shall setSelectedIndex to the index. */
    setState?: boolean;
  }) => {
    // using scrollTo in ios, onMomentumScrollEnd will be invoked
    if (isIos)
      setIsIosScrollingTo(true);
    setIsScrollingTo(true);
    if (setState)
      setSelectedIndex(index);
    const y = itemHeight * index;
    scrollRef.current?.scrollTo({ y, animated });
  }, [itemHeight]);


  // const [isProbablyMoving, setIsProbablyMoving] = useState(false)
  // const timer2 = useRef<NodeJS.Timeout | null>(null)
  // useEffect(() => {
  //   if ()
  //     setIsProbablyMoving(true)
  // }, [])

  const isPossiblyMoving = isBeingDragged || isOnMomentum || timer || isScrollingTo;


  const selectedIndex = constrainIndex((isPossiblyMoving) ? _selectedIndex : (selectedIndexProp ?? _selectedIndex), data.length);


  /** On data change. */
  const prevData = useRef<T[]>(data);
  useEffect(() => {
    if (data !== prevData.current) {
      prevData.current = data;
      setSelectedIndex(selectedIndex); // Fix if needed.
      // scrollToIndex({ animated: true, index: selectedIndex }),
    }
  }, [data, scrollToIndex, selectedIndex]);

  // const [isOnScrollFix, setIsOnScrollFix] = useState(false)

  /** Fix index if required on data.length change. */
  // useEffect(() => {
  //   const index = constrainIndex(selectedIndex, data.length);
  //   if (index !== selectedIndex) {
  //     setSelectedIndex(index);
  //     // onValueChange?.({ index, value: data[index]! });
  //   }
  // }, [data, onValueChange, selectedIndex]);

  useEffect(() => {
    onValueChange?.({ value: data[selectedIndex]!, index: selectedIndex });
  }, [data, onValueChange, selectedIndex]);

  const containerHeight = p.containerHeight
    || ((isViewStyle(p.style) && isNumeric(p.style.height)) ? Number(p.style.height) : 0)
    || itemHeight * 5; // To have 5 items being shown

  const [initialized, setInitialized] = useState(false);




  /** On init */
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    // There was a setTimeout(x, 0) for some reason but doesn't seem to fix anything.
    scrollToIndex({ index: selectedIndex, animated: false });
    return () => { timer && clearTimeout(timer); };
  }, [initialized, scrollToIndex, selectedIndex, timer]);


  const renderItem = (item: T, index: number) => {
    const isSelected = index === selectedIndex;
    const distance = Math.abs(index - selectedIndex);
    const element = p.renderItem
      ? p.renderItem({ item, index, isSelected, distance })
      : <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item}</Text>;

    return (
      <Pressable
        style={[styles.itemWrapper, { height: itemHeight }]}
        key={p.keyExtractor?.({ item, index }) ?? index}
        // onPress={() => scrollToIndex({ index, animated: true, setState: true })} // Pressable until I manage to fix it.
      >
        {element}
      </Pressable>
    );
  };

  /** Handles parent selectedIndex change or on data length change index fix. */
  const prevSelectedIndex = useRef<number>(NaN);
  useEffect(() => {
    if (selectedIndex !== prevSelectedIndex.current) {
      prevSelectedIndex.current = selectedIndex;
      if (!isBeingDragged && !isOnMomentum && !isScrollingTo)
        scrollToIndex({ index: selectedIndex, animated: true });
    }
  }, [isBeingDragged, isOnMomentum, isScrollingTo, scrollToIndex, selectedIndex]);


  const handleScrollPosition = useCallback((
    e: NativeSyntheticEvent<NativeScrollEvent>,
    /** Useful to avoid snapping while dragging. */
    doSnap: boolean = true,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const scrollY = e.nativeEvent.contentOffset.y ?? 0; // On original code it checked contentOffset truthyness. Needed?
    const newSelectedIndex = Math.round(scrollY / itemHeight);

    if (doSnap) {
      const targetScrollY = newSelectedIndex * itemHeight;
      if (targetScrollY !== scrollY)
        scrollToIndex({ index: newSelectedIndex, animated: true });
    }

    setSelectedIndex(newSelectedIndex);

  }, [itemHeight, scrollToIndex]);

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  };

  const onScrollBeginDrag = () => {
    setIsBeingDragged(true);
    if (Platform.OS === 'ios')
      setIsIosScrollingTo(false);
    clearTimer();
  };
  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsBeingDragged(false);
    // if not used, event will be garbaged and won't be defined inside the timer.
    const eCopy: NativeSyntheticEvent<NativeScrollEvent> = { ...e };
    clearTimer();
    setTimer(setTimeout(() => {
      if (!isOnMomentum) {
        clearTimer();
        setIsScrollingTo(false);
        handleScrollPosition(eCopy);
      }}, 100));
  };
  const onMomentumScrollBegin = () => {
    setIsOnMomentum(true);
    clearTimer();
  };
  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsOnMomentum(false);
    if (!isIosScrollingTo && !isBeingDragged)
      handleScrollPosition(e);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Ignore updates w
    // if (!isScrollingTo)
    handleScrollPosition(e, false);
  };

  /** Before the first item and after the last item. Allows vertical centering the firsts and lasts items. */
  const verticalSpacing = useMemo(() => {
    const h = (containerHeight - itemHeight) / 2;
    return <View style={{ height: h, flex: 1 }}/>;
  }, [containerHeight, itemHeight]);



  return (
    <View style={[styles.containerStyle, { height: containerHeight }, p.containerStyle]}>
      {/* The line above and below the center */}
      {highlightColor && <View style={{
        position: 'absolute',
        top: (containerHeight - itemHeight) / 2,
        height: itemHeight,
        width: (isViewStyle(p.style) ? p.style.width : 0) || deviceWidth,
        borderColor: highlightColor,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
      }}/>}
      <ScrollView
        ref={scrollRef}
        bounces={false}
        showsVerticalScrollIndicator={false}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        // onScrollAnimationEnd={onScrollAnimationEnd} // It isn't called for some reason.
        onScroll={changeValueWhileDragging ? onScroll : undefined}
        /** Get every scroll change. https://stackoverflow.com/questions/29503252/get-current-scroll-position-of-scrollview-in-react-native */
        scrollEventThrottle={changeValueWhileDragging ? 4 : undefined} // Don't know if it's being good, or bad. 16 wasn't better. 4 seemed better?
        overScrollMode='never'
      >
        {/* Pressable to fix scroll hardly working https://stackoverflow.com/a/67028240/10247962 */}
        <Pressable>
          {verticalSpacing}
          {data.map(renderItem)}
          {verticalSpacing}
        </Pressable>
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    overflow: 'hidden',
  },
  itemWrapper: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: '#999',
    // textAlign: 'center',
    // fontSize: 19,
    // fontFamily: F.Inter_400Regular,
  },
  itemTextSelected: {
    color: '#333',
    // fontSize: 21,
    // color: C.mainDarker1,
    // fontFamily: F.Inter_500Medium,
  },
});