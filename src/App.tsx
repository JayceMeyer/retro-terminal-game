import { useState } from 'react'
import { ThemeProvider } from 'styled-components'
import Terminal from './components/Terminal'
import { ThemeContext, themes } from './contexts/ThemeContext'
import { GlobalStyle } from './styles/GlobalStyle'
import { ColorScheme } from './types/types'

function App() {
  const [theme, setTheme] = useState<ColorScheme>('green')

  const changeTheme = (newTheme: ColorScheme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      <ThemeProvider theme={themes[theme]}>
        <GlobalStyle />
        <Terminal />
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default App
