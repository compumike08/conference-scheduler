export const UserRole = {
  ROLE_USER: "ROLE_USER",
  ROLE_MEMBER: "ROLE_MEMBER",
  ROLE_SCHEDULER: "ROLE_SCHEDULER",
  ROLE_ADMIN: "ROLE_ADMIN"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleNoMemberOrUser = {
  ROLE_SCHEDULER: "ROLE_SCHEDULER",
  ROLE_ADMIN: "ROLE_ADMIN"
} as const;

export type UserRoleNoMemberOrUser = (typeof UserRoleNoMemberOrUser)[keyof typeof UserRoleNoMemberOrUser];

export const EMAIL_VALIDATION_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
