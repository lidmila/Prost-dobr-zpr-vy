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

export const REGIONS = [
  { key: 'all', label: 'Vše' },
  { key: 'cz-sk', label: 'CZ & SK' },
  { key: 'world', label: 'Svět' },
] as const;

export const TIME_RANGES = [
  { key: 'all', label: 'Vše' },
  { key: '24h', label: '24h' },
  { key: '48h', label: '48h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
] as const;

export type Category = (typeof CATEGORIES)[number]['key'];
export type Region = (typeof REGIONS)[number]['key'];
export type TimeRange = (typeof TIME_RANGES)[number]['key'];
