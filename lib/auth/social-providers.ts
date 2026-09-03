import 'server-only';

import type { SocialProvider } from '@/components/auth/social-sign-in';

export function getEnabledSocialProviders(): SocialProvider[] {
  const providers: SocialProvider[] = [];

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push('github');
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push('google');
  }

  return providers;
}
