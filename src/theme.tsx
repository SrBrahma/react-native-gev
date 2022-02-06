import { createGlobalState } from 'react-hooks-global-state';
import deepmerge from 'deepmerge';
// import { useColorScheme } from 'react-native';


/** Prettyfies object type */
type Id<T> = unknown & { [P in keyof T]: T[P] };
// https://stackoverflow.com/a/61132308/10247962
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;


// Some were based on https://callstack.github.io/react-native-paper/theming.html
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
    // TODO: /** Defaults to primary */
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




type Theme = {
  common: Common;
  colors: Colors;
  // presets: Presets;
};



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


const defaultInitialTheme = 'light';
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





/** Selects the theme */
function createUseThemeData({ themes, themeId, initialTheme }: {themes: DeepPartialThemes; themeId?: string; initialTheme: string}): ThemeReturn {
  const theme: Theme = deepmerge.all([
    defaultLightTheme,
    themes[defaultInitialTheme] ?? {},
    themes[initialTheme] ?? {},
    ...(themeId ? [themes[themeId] ?? {}] : []),
  ]) as Theme;

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



const { useGlobalState, setGlobalState } = createGlobalState<{
  useThemeData: ThemeReturn;
}>({
  useThemeData: createUseThemeData({
    themes: { light: defaultLightTheme },
    initialTheme: defaultInitialTheme,
  }),
});


/** To be used only inside react-native-gev. To use in your app, use createThemes(). */
export function useTheme(): ThemeReturn {
  return useGlobalState('useThemeData')[0]; // [0] is the state. [1] is the setGlobalState.
}




type DeepPartialThemes = {
  light?: DeepPartial<Theme>;
  dark?: DeepPartial<Theme>;
  // [others: string]: DeepPartial<Theme>,
} & Record<string, DeepPartial<Theme>>;

type CreateThemeRtn = {
  useTheme: () => ThemeReturn;
};

type CreateThemeOptions = {
  initialTheme?: string;
};

/** Changes the default colors of react-native-gev components.
 *
 * You may also use the given colors in your app by using useTheme() hook.
 *
 * As it uses `react-hooks-global-state`, it doesn't need a context provider. */
export function createTheme<T extends DeepPartialThemes>(themes: T, opts?: CreateThemeOptions): CreateThemeRtn {
  createUseThemeData({
    themes,
    initialTheme: opts?.initialTheme ?? defaultInitialTheme,
  });
  return {
    useTheme,
  };
}