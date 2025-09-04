import type { ThemeMode } from '@/types/preferences/theme';

export function updateThemeMode(value: ThemeMode) {
  const doc = document.documentElement;
  doc.classList.add('disable-transitions');
  doc.classList.toggle('dark', value === 'dark');
  requestAnimationFrame(() => {
    doc.classList.remove('disable-transitions');
  });
}

export function updateThemePreset(value: string) {
  document.documentElement.setAttribute('data-theme-preset', value);
}
