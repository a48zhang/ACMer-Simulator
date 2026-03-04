import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryHover: string;
      secondary: string;
      secondaryHover: string;
      danger: string;
      dangerHover: string;
      warning: string;
      background: string;
      surface: string;
      textMain: string;
      textSecondary: string;
      textTertiary: string;
      border: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    radius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
  }
}
