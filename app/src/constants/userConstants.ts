export const UserRole = {
  ROLE_USER: "ROLE_USER",
  ROLE_MEMBER: "ROLE_MEMBER",
  ROLE_SCHEDULER: "ROLE_SCHEDULER",
  ROLE_ADMIN: "ROLE_ADMIN"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
