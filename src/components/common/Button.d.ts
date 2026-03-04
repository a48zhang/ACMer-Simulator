import { ButtonHTMLAttributes } from 'react';
import { StyledComponent } from 'styled-components';
import { DefaultTheme } from 'styled-components';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'danger';
  size?: 'sm' | 'lg';
  block?: boolean;
}

export declare const Button: StyledComponent<'button', DefaultTheme, ButtonProps>;
