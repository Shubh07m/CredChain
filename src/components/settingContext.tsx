import { createContext, useState,type ReactNode } from "react"

export type Mode = "light" | "dark" | "system"

export interface Settings {
  mode: Mode
  theme: {
    styles: {
      light: Record<string, any>
      dark: Record<string, any>
    }
  }
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (settings: Settings) => void
}

const defaultSettings: Settings = {
  mode: "light",
  theme: {
    styles: {
      light: {},
      dark: {},
    },
  },
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}