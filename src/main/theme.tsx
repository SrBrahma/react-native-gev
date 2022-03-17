import type { DeepPartial } from 'react-hook-form';
import { createGlobalState } from 'react-hooks-global-state';
import deepmerge from 'deepmerge';
import type { ButtonPropsTheme } from '../components/Inputs/Button';
import type { TextInputPropsTheme } from '../components/Inputs/TextInput/TextInput';
import { TextInputFormal } from '../components/Inputs/TextInput/TextInputFormal';
import { TextInputOutline } from '../components/Inputs/TextInput/TextInputOutline';
import type { DeepPartialAndExpandable, EmptyObj, Obj } from '../internalUtils/types';
import type { Fonts } from './fonts';
import { defaultFonts } from './fonts';
// import { useColorScheme } from 'react-native';

// Using interface when possible as it's said to have a better TS performance. (does it really improve?)
// It's being an issue since the addition of `props` prop.


interface Theme {
  colors: Colors;
  sizes: Common;
  /** The fonts for basic texts. */
  fonts: Fonts;
  /** Default props for our components. Easier customization!
   *
   * The styles are merged.
   *
   * It may either be the component props or a function that returns it.
   *
   * If it's a function, it's run like a React hook, so you may useTheme().
   *
   * Wrapping the function's object-props return in a useMemo is recommended for a better performance. */
  defaultProps: DefaultProps;
}


// Some were based on https://callstack.github.io/react-native-paper/theming.html
interface Colors {
  primary: string;
  /** For primary colored texts above background.
   * @default primary */
  primaryDarkerText: string;
  // primaryLighter1: in hsl() format, it shall have ~10% more lightness
  // secondary: string;
  background: string;
  disabled: string;
  error: string;
  text: string;
  /** Color for placeholder text, such as input placeholder. */
  placeholder: string;
  /** Color for backdrops of various components such as modals. */
  backdrop: string;
  /** Similar to background, but for elements with content such as cards.
   * @default background */
  surface: string;
  // /** background color for snackbars */
  // onSurface: string
  // /** background color for badges */
  // notification: string
  /** For Navigation/Header.tsx
   * @default primary */
  header: string;
  /** @default primary */
  badge: string;
  _snackbar: {
    /** For common messages.
     * @default background */
    neutral: string;
    /** For common messages.
     * @default text */
    textOnNeutral: string;
    /** For error messages. */
    error: string;
    /** For common messages. */
    textOnError: string;
  };
  _button: {
    /** @default background */
    text: string;
    /** @default primary */
    action: string;
    /** @default primaryDarkerText */
    actionTextInverted: string;
    /** @default error */
    destructive: string;
    // TODO defaults to [?]
    neutral: string;
  };
  _list: {
    /** @default '#869286' (TODO replace, old app value) */
    pretitle: string;
    /** @default '#111' */
    title: string;
    /** @default '#777' */
    subtitle: string;
    /** @default _list.title, '#111' */
    icon: string;
  };
}


const defaultSizes = {
  borderRadius: 4,
  screen: {
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  screenShort: {
    paddingVerticalShort: 20,
    paddingHorizontalShort: 16,
  },
};
// Not hard typed as it is boring to set it up .
type Common = typeof defaultSizes;


interface DefaultProps {
  TextInput: TextInputPropsTheme;
  Button: ButtonPropsTheme;
}


/** The colors that defaults to those ones are set in applyThemeFallbacks. */
const defaultTheme: DeepPartial<Theme> = {
  sizes: defaultSizes,
  fonts: { ...defaultFonts },
  colors: {
    primary: '#55f',
    background: '#fff',
    text: '#000',
    backdrop: '#00000056',
    disabled: '#dbdbdb',
    error: '#dd0020',
    placeholder: '#aaa',
    _button: {
      neutral: '#eee',
    },
    _snackbar: {
      error: '#dd464bfa',
      textOnError: '#fff',
    },
    _list: {
      title: '#111',
      subtitle: '#777',
      pretitle: '#869286',
    },
  },
  defaultProps: {
    TextInput: {
      type: 'formal',
      typeProps: {
        formal: {
          Component: TextInputFormal,
        },
        outline: {
          Component: TextInputOutline,
        },
      },
    },
  },
};
const defaultInitialThemeId = 'light';


type ThemeReturn<T extends Obj = EmptyObj> = Theme & T & {
  $settings: {
    /** The themes that are available. */
    availableThemes: string[];
    currentTheme: string;
    changeTheme: (theme: string) => void;
    // onSystemColorChange
  };
};

const { useGlobalState, setGlobalState } = createGlobalState<{useThemeData: ThemeReturn}>({
  useThemeData: createUseThemeData<Theme>({
    themes: { light: defaultTheme },
    initialTheme: defaultInitialThemeId,
  }),
});



type Themes<T extends Obj = EmptyObj> = {
  light: Theme;
  dark: Theme;
} & T;


/** Some colors fallbacks to other colors. */
function applyThemeFallbacks(theme: DeepPartial<Theme>): Theme {
  return deepmerge.all([{
    colors: {
      primaryDarkerText: theme.colors?.primary,
      badge: theme.colors?.primary,
      header: theme.colors?.primary,
      _button: {
        text: theme.colors?.background,
        action: theme.colors?.primary,
        // Sure?
        actionTextInverted: theme.colors?.primaryDarkerText ?? theme.colors?._button?.action ?? theme.colors?.primary,
        destructive: theme.colors?.error,
      },
      _snackbar: {
        neutral: theme.colors?.background,
        textOnNeutral: theme.colors?.text,
      },
      _list: {
        icon: theme.colors?._list?.title,
      },
      surface: theme.colors?.background,
    },
  } as DeepPartial<Theme>, theme]) as Theme;
}

/** Selects the theme */
function createUseThemeData<T extends Obj = EmptyObj>({ themes, themeId, initialTheme }: {
  themes: DeepPartial<Themes<T>>; themeId?: string; initialTheme?: string;
}): ThemeReturn<T> {
  const currentTheme = themeId ?? initialTheme ?? defaultInitialThemeId;

  const theme = applyThemeFallbacks(deepmerge.all([
    defaultTheme,
    initialTheme ? (themes[initialTheme] ?? {}) : {},
    themes[currentTheme] ?? {},
  ])) as Theme & T;

  function changeTheme(themeId: string) {
    setGlobalState('useThemeData', createUseThemeData({ themes, themeId, initialTheme }));
  }

  return {
    ...theme,
    $settings: {
      availableThemes: Object.keys(themes),
      currentTheme,
      changeTheme,
    },
  };
}


/** To be used only inside react-native-gev. To use in your app, use createThemes(). */
export function useTheme<T extends Obj = EmptyObj>(): ThemeReturn<T> {
  return useGlobalState('useThemeData')[0] as ThemeReturn<T>; // [0] is the state. [1] is the setGlobalState.
}




/** It doesn't error when writing non-existing props. */
type DeepPartialAndExpandableThemes<T extends Obj = EmptyObj> = DeepPartialAndExpandable<Themes<T>>;

interface CreateThemeOptions {
  initialTheme?: string;
}
interface CreateThemeRtn<T extends Obj = EmptyObj> {
  useTheme: () => ThemeReturn<T>;
}

/** Changes the default colors of react-native-gev components.
 *
 * You may also use the given colors in your app by using useTheme() hook.
 *
 * As it uses `react-hooks-global-state`, it doesn't need a context provider. */
export function createTheme<T extends DeepPartialAndExpandableThemes>(themes: T, opts?: CreateThemeOptions): CreateThemeRtn<Omit<T, 'props'>[keyof Omit<T, 'props'>]> {
  setGlobalState('useThemeData', createUseThemeData({
    themes: themes as any,
    initialTheme: opts?.initialTheme,
  }));
  return {
    useTheme: useTheme as any,
  };
}