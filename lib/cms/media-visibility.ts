import { type UserRole } from '@/app/generated/prisma/client';
import { hasCapability } from '@/lib/auth/capabilities';

type Actor = {
  id: string;
  role: UserRole;
};

export function mediaVisibilityWhere(
  actor: Actor,
  ownerOnly = false
): { uploadedById?: string } {
  if (!ownerOnly && hasCapability(actor.role, 'editOthersContent')) {
    return {};
  }

  return { uploadedById: actor.id };
}
