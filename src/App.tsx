import { useState } from 'react'
import { ThemeProvider } from 'styled-components'
import Terminal from './components/Terminal'
import { ThemeContext, themes } from './contexts/ThemeContext'
import { GlobalStyle } from './styles/GlobalStyle'
import { ColorScheme, ThemeType } from './types/types'

// Add theme type declaration merge for styled-components
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}

export default function App() {
  const [theme, setTheme] = useState<ColorScheme>('green')

  const changeTheme = (newTheme: ColorScheme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      <ThemeProvider theme={themes[theme]}>
        <GlobalStyle theme={themes[theme]} />
        <Terminal />
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
