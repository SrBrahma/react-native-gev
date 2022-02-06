import { createGlobalState } from 'react-hooks-global-state';
import deepmerge from 'deepmerge';
// import { useColorScheme } from 'react-native';



type Id<T> = unknown & { [P in keyof T]: T[P] };


type Colors = {
  primary: string;
  // secondary: string;
  background: string;
  disabled: string;
  /** Color for placeholder text, such as input placeholder. */
  text: string;
  placeholder: string;
  /** Color for backdrops of various components such as modals. */
  backdrop: string;
  // /** background color for snackbars */
  // onSurface: string
  // /** background color for badges */
  // notification: string
  /** For Navigation/Header.tsx */
  header: string;
  _button: {
    text: string;
    action: string;
    neutral: string;
    destructive: string;
  };
};


const defaultCommon = {
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
type Common = typeof defaultCommon;


// const defaultPresets = {
//   screenBasic: {
//     flex: 1,
//     paddingVertical: 40,
//     paddingHorizontal: 32,
//   },
//   screenBasicShort: {
//     flex: 1,
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//   }
// }

// Some were based on https://callstack.github.io/react-native-paper/theming.html
type Theme = {
  common: Common;
  colors: Colors;
  // presets: Presets;
};

/** Used in createThemes to set everything up. */
type ThemesParam = {
  /** @default 'light' */
  initialTheme: string;
  /** Roundness of the button, at least. */
  themes: Record<string, Theme>;
};


// type Transforme
type ThemeReturn = Id<
  Theme & {
    $settings: {
      /** The themes that are available. */
      availableThemes: string[];
      currentTheme: string;
      changeTheme: (theme: string) => void;
      // onSystemColorChange
    };
  }
>;


const defaultLightTheme: Theme = {
  common: defaultCommon,
  colors: {
    primary: '#ff4',
    background: '#fff',
    text: '#000',
    backdrop: '#00000056',
    disabled: '#dadada',
    _button: {
      text: '#fff',
      action: '#f88',
      neutral: '#eee',
      destructive: '#c22',
    },
    header: '#444',
    placeholder: '#aaa',
  },
};

const defaultInitialTheme = 'light';
const defaultThemeContextValue: ThemesParam = {
  initialTheme: defaultInitialTheme,
  themes: {
    light: defaultLightTheme,
  },
};



function createUseThemeData({ themesParam, themeId }: {themesParam: ThemesParam; themeId?: string}): ThemeReturn {
  const theme: Theme = deepmerge.all([
    themesParam.themes[defaultInitialTheme] ?? {},
    themesParam.themes[themesParam.initialTheme] ?? {},
    ...(themeId ? [themesParam.themes[themeId] ?? {}] : []),
  ]) as Theme;

  return {
    ...theme,
    $settings: {
      availableThemes: Object.keys(themesParam.themes),
      currentTheme: themeId ?? themesParam.initialTheme, // initialTheme defaults to defaultInitialTheme.
      changeTheme: (themeId) => setGlobalState('theme', () => createUseThemeData({ themesParam, themeId })),
    },
  };
}



const { useGlobalState, setGlobalState } = createGlobalState<{
  params: ThemesParam;
  theme: ThemeReturn;
}>({
  params: defaultThemeContextValue,
  theme: createUseThemeData({ themesParam: defaultThemeContextValue, themeId: defaultInitialTheme }),
});


/** To be used only inside react-native-gev. To use in your app, use createThemes(). */
export function useTheme(): ThemeReturn {
  return useGlobalState('theme')[0];
}

// https://stackoverflow.com/a/61132308/10247962
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;


type CreateThemePops = {
  light?: DeepPartial<Theme>;
  dark?: DeepPartial<Theme>;
  // [others: string]: DeepPartial<Theme>,
} & Record<string, DeepPartial<Theme>>;

type CreateThemeRtn = {
  useTheme: () => ThemeReturn;
};

type CreateThemeOptions = {
  noOptionsYet: null;

};

/** Changes the default colors of react-native-gev components.
 *
 * You may also use the given colors in your app by using useTheme() hook.
 *
 * As it uses `react-hooks-global-state`, it doesn't need a context provider. */
export function createTheme<T extends CreateThemePops>(t: T, opts?: CreateThemeOptions): CreateThemeRtn {
  createUseThemeData;
  return {
    useTheme,
  };
}