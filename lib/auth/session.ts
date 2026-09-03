import 'server-only';

import { cache } from 'react';
import { io } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { UserRole } from '@/app/generated/prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { type Capability, hasCapability } from './capabilities';

export class AuthorizationError extends Error {
  constructor(message = 'You are not authorized to perform this action.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: UserRole;
  displayName?: string | null;
};

export type CurrentUser = {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Better Auth reads cookie expiry with `new Date()`. Keep that out of the
  // prerender so Cache Components does not treat the session as unstable.
  await io();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const sessionUser = session.user as AuthSessionUser;

  if (sessionUser.role) {
    return {
      id: sessionUser.id,
      name: sessionUser.name,
      displayName: sessionUser.displayName ?? null,
      email: sessionUser.email,
      emailVerified: sessionUser.emailVerified,
      image: sessionUser.image ?? null,
      role: sessionUser.role,
    };
  }

  return prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
    },
  });
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) redirect('/sign-in');

  return user;
}

export async function requireCapability(
  capability: Capability
): Promise<CurrentUser> {
  const user = await requireUser();

  if (!hasCapability(user.role, capability)) {
    throw new AuthorizationError();
  }

  return user;
}
