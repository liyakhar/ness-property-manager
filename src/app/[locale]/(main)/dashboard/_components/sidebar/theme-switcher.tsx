'use client';

import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { setClientCookie } from '@/lib/client-cookies';
import { updateThemeMode } from '@/lib/theme-utils';
import { usePreferencesStore } from '@/stores/preferences/preferences-provider';

export function ThemeSwitcher() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  const handleValueChange = async () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    updateThemeMode(newTheme);
    setThemeMode(newTheme);
    await setClientCookie('theme_mode', newTheme);
  };

  return (
    <Button size="icon" onClick={handleValueChange}>
      {themeMode === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
