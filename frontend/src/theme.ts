import { extendTheme } from '@chakra-ui/react'
import type { ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  lemon: {
    50: '#FFFFF0',
    100: '#FEFCBF',
    500: '#F6E05E', // lemon yellow
  },
  lime: {
    500: '#68D391', // lime green
  },
  orange: {
    500: '#ED8936', // orange
  },
}

const fonts = {
  heading: 'var(--font-open-sans)',
  body: 'var(--font-lato)',
}

const styles = {
  global: {
    body: {
      bg: 'gray.50',
    },
  },
}

export default extendTheme({
  config,
  colors,
  fonts,
  styles,
})
