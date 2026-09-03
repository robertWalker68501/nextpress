export const NEXTPRESS_LOGO = {
  light: '/assets/images/logo-light.png',
  dark: '/assets/images/logo-dark.png',
} as const;

export function nextPressLogoAbsoluteUrl(theme: 'light' | 'dark' = 'light') {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ).replace(/\/$/, '');

  return `${base}${NEXTPRESS_LOGO[theme]}`;
}
