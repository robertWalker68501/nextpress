import { Badge } from '@/components/ui/badge';
import { getRoleLabel, type UserRoleValue } from '@/lib/auth/roles';

const variants = {
  ADMINISTRATOR: 'default',
  EDITOR: 'secondary',
  AUTHOR: 'outline',
  CONTRIBUTOR: 'outline',
  SUBSCRIBER: 'ghost',
} as const satisfies Record<
  UserRoleValue,
  'default' | 'secondary' | 'outline' | 'ghost'
>;

export function UserRoleBadge({ role }: { role: UserRoleValue }) {
  return <Badge variant={variants[role]}>{getRoleLabel(role)}</Badge>;
}
