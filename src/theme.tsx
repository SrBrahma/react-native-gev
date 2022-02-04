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



function getThemeReturn({ themesParam, themeId }: {themesParam: ThemesParam; themeId: string}): ThemeReturn {
  const theme: Theme = deepmerge.all([
    themesParam.themes[defaultInitialTheme] ?? {},
    themesParam.themes[themesParam.initialTheme] ?? {},
    themesParam.themes[themeId] ?? {},
  ]) as Theme;

  return {
    ...theme,
    $settings: {
      availableThemes: Object.keys(themesParam.themes),
      currentTheme: themeId,
      changeTheme: (themeId) => setGlobalState('theme', () => getThemeReturn({ themesParam, themeId })),
    },
  };
}



const { useGlobalState, setGlobalState } = createGlobalState<{
  params: ThemesParam;
  theme: ThemeReturn;
}>({
  params: defaultThemeContextValue,
  theme: getThemeReturn({ themesParam: defaultThemeContextValue, themeId: defaultInitialTheme }),
});


/** To be used only inside react-native-gev. To use in your app, use createThemes(). */
export function useTheme(): ThemeReturn {
  return useGlobalState('theme')[0];
}

// https://stackoverflow.com/a/61132308/10247962
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export function createThemes<T extends Record<string, DeepPartial<Theme>>>({}: {
  themes: T;
  // /** The theme to fallback to. After this fallback, it will fallback to `'light'`. */
  // defaultThemeId?: string
  // /** The theme it will start in.  */
  // initialThemeId?: string
  //
  // /** If should use `useColorScheme` to  */
  // useUseColorScheme?: boolean
}): {
  useTheme: typeof useTheme;
} {
  return {
    useTheme,
  };
}