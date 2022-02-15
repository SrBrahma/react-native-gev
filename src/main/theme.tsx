import { createGlobalState } from 'react-hooks-global-state';
import deepmerge from 'deepmerge';
import type { Fonts } from './fonts';
import { defaultFonts } from './fonts';
// import { useColorScheme } from 'react-native';


/** Prettyfies object type */
type Id<T> = unknown & { [P in keyof T]: T[P] };
// https://stackoverflow.com/a/61132308/10247962
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
type DeepPartialAndExpandable<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]> & Record<string, any>;
} : T;
type Obj = Record<string, any>;
type EmptyObj = Record<never, never>; // <string, never> would give a {[x: string]: never} in the Theme.




// Some were based on https://callstack.github.io/react-native-paper/theming.html
type Colors = {
  primary: string;
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
    /** @default error */
    destructive: string;
    // TODO defaults to [?]
    neutral: string;
  };
};


const defaultSizes = {
  roundness: 4,
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




type Theme<T extends Obj = EmptyObj> = T & {
  colors: Colors;
  sizes: Common;
  /** The fonts for basic texts. */
  fonts: Fonts;
  // presets: Presets;
};


const partialDefaultTheme: DeepPartial<Theme> = {
  sizes: defaultSizes,
  fonts: { ...defaultFonts },
  colors: {
    primary: '#55f',
    background: '#fff',
    text: '#000',
    backdrop: '#00000056',
    disabled: '#dadada',
    error: '#dd0020',
    placeholder: '#aaa',
    _button: {
      neutral: '#eee',
    },
    _snackbar: {
      error: '#dd464bfa',
      textOnError: '#fff',
    },
  },
};


/** Some colors fallbacks to other colors. */
function applyThemeFallbacks(theme: DeepPartial<Theme>): Theme {
  return deepmerge.all([{
    colors: {
      badge: theme.colors?.primary,
      header: theme.colors?.primary,
      _button: {
        text: theme.colors?.background,
        action: theme.colors?.primary,
        destructive: theme.colors?.error,
      },
      _snackbar: {
        neutral: theme.colors?.background,
        textOnNeutral: theme.colors?.text,
      },
    },
  } as DeepPartial<Theme>, theme]) as Theme;
}

const defaultTheme = applyThemeFallbacks(partialDefaultTheme);
const defaultInitialThemeId = 'light';


type ThemeReturn<T extends Obj = EmptyObj> = Theme<T> & {
  $settings: {
    /** The themes that are available. */
    availableThemes: string[];
    currentTheme: string;
    changeTheme: (theme: string) => void;
    // onSystemColorChange
  };
};

const { useGlobalState, setGlobalState } = createGlobalState<{useThemeData: ThemeReturn}>({
  useThemeData: createUseThemeData({
    themes: { common: defaultTheme },
    initialTheme: defaultInitialThemeId,
  }),
});



type Themes<T extends Obj = EmptyObj> = {
  common: Theme;
  light: Theme;
  dark: Theme;
} & T;

/** Selects the theme */
function createUseThemeData<T extends Obj = EmptyObj>({ themes, themeId, initialTheme }: {
  themes: DeepPartial<Themes<T>>; themeId?: string; initialTheme: string;
}): ThemeReturn<T> {
  const theme = applyThemeFallbacks(deepmerge.all([
    themes[initialTheme] ?? {},
    defaultTheme,
    ...(themeId ? [themes[themeId] ?? {}] : []),
  ]) as Theme<T>) as Theme<T>;

  function changeTheme(themeId: string) {
    setGlobalState('useThemeData', createUseThemeData({ themes, themeId, initialTheme }));
  }

  return {
    ...theme,
    $settings: {
      availableThemes: Object.keys(themes),
      currentTheme: themeId ?? initialTheme, // initialTheme defaults to defaultInitialTheme.
      changeTheme,
    },
  };
}


/** To be used only inside react-native-gev. To use in your app, use createThemes(). */
export function useTheme<T>(): ThemeReturn<T> {
  return useGlobalState('useThemeData')[0] as ThemeReturn<T>; // [0] is the state. [1] is the setGlobalState.
}




/** It doesn't error when writing non-existing props. */
type DeepPartialAndExpandableThemes<T extends Obj = EmptyObj> = DeepPartialAndExpandable<Themes<T>>;

type CreateThemeOptions = {
  initialTheme?: string;
};
type CreateThemeRtn<T extends Obj = EmptyObj> = {
  useTheme: () => ThemeReturn<T>;
};

/** Changes the default colors of react-native-gev components.
 *
 * You may also use the given colors in your app by using useTheme() hook.
 *
 * As it uses `react-hooks-global-state`, it doesn't need a context provider. */
export function createTheme<T extends DeepPartialAndExpandableThemes>(themes: T, opts?: CreateThemeOptions): Id<CreateThemeRtn<T[keyof T]>> {
  setGlobalState('useThemeData', createUseThemeData({
    themes: themes as any,
    initialTheme: opts?.initialTheme ?? defaultInitialThemeId,
  }));
  return {
    useTheme: useTheme as any,
  };
}