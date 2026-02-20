export const CATEGORIES = [
  { key: 'all', label: 'Vše', icon: 'apps' },
  { key: 'environment', label: 'Životní prostředí', icon: 'leaf' },
  { key: 'health', label: 'Zdraví', icon: 'heart' },
  { key: 'education', label: 'Vzdělávání', icon: 'school' },
  { key: 'technology', label: 'Technologie', icon: 'hardware-chip' },
  { key: 'community', label: 'Komunita', icon: 'people' },
  { key: 'culture', label: 'Kultura', icon: 'color-palette' },
  { key: 'science', label: 'Věda', icon: 'flask' },
  { key: 'sport', label: 'Sport', icon: 'football' },
  { key: 'business', label: 'Byznys', icon: 'briefcase' },
] as const;

export const LANGUAGES = [
  { key: 'all', label: 'Vše' },
  { key: 'cs', label: 'Čeština' },
  { key: 'sk', label: 'Slovenčina' },
  { key: 'en', label: 'English' },
  { key: 'de', label: 'Deutsch' },
] as const;

export const LOCATIONS = [
  { key: 'all', label: 'Vše' },
  { key: 'czech', label: 'Česko' },
  { key: 'slovak', label: 'Slovensko' },
  { key: 'world', label: 'Svět' },
] as const;

export type Category = (typeof CATEGORIES)[number]['key'];
export type Language = (typeof LANGUAGES)[number]['key'];
export type Location = (typeof LOCATIONS)[number]['key'];
