export const UserRoleValue = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  EDITOR: 'EDITOR',
  AUTHOR: 'AUTHOR',
  CONTRIBUTOR: 'CONTRIBUTOR',
  SUBSCRIBER: 'SUBSCRIBER',
} as const;

export type UserRoleValue = (typeof UserRoleValue)[keyof typeof UserRoleValue];

export const roleLabels = {
  [UserRoleValue.ADMINISTRATOR]: 'Administrator',
  [UserRoleValue.EDITOR]: 'Editor',
  [UserRoleValue.AUTHOR]: 'Author',
  [UserRoleValue.CONTRIBUTOR]: 'Contributor',
  [UserRoleValue.SUBSCRIBER]: 'Subscriber',
} satisfies Record<UserRoleValue, string>;

export function getRoleLabel(role: keyof typeof roleLabels) {
  return roleLabels[role];
}

export const roleOptions = Object.values(UserRoleValue).map((value) => ({
  label: roleLabels[value],
  value,
}));
