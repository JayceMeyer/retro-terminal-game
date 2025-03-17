import { createGlobalStyle } from 'styled-components';
import { ThemeType } from '../types/types';

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: ${({ theme }) => theme.font};
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    padding: 20px;
  }
  
  #app {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;
