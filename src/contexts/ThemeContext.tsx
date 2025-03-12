import { createContext } from 'react';
import { ColorScheme, ThemeType } from '../types/types';

export const themes: Record<ColorScheme, ThemeType> = {
  green: {
    primary: '#00ff00',
    background: '#0D0208',
    text: '#33ff33',
    cursor: '#33ff33',
    highlight: '#005500',
    font: '"VT323", monospace'
  },
  red: {
    primary: '#ff0000',
    background: '#0D0208',
    text: '#ff3333',
    cursor: '#ff3333',
    highlight: '#550000',
    font: '"VT323", monospace'
  },
  blue: {
    primary: '#0000ff',
    background: '#0D0208',
    text: '#3333ff',
    cursor: '#3333ff',
    highlight: '#000055',
    font: '"VT323", monospace'
  },
  amber: {
    primary: '#ffbf00',
    background: '#0D0208',
    text: '#ffbf00',
    cursor: '#ffbf00',
    highlight: '#553300',
    font: '"VT323", monospace'
  },
  white: {
    primary: '#ffffff',
    background: '#0D0208',
    text: '#eeeeee',
    cursor: '#eeeeee',
    highlight: '#555555',
    font: '"VT323", monospace'
  }
};

interface ThemeContextType {
  theme: ColorScheme;
  changeTheme: (theme: ColorScheme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'green',
  changeTheme: () => {}
});
