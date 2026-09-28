interface UsersSearchTypeOptionsConfig {
  readonly code: string;
  readonly label: string;
}

// Create the immutable map using 'as const'
export const UsersSearchTypeOptions = {
  OPT_USERNAME: { code: "OPT_USERNAME", label: "Username" },
  OPT_USER_ROLE: { code: "OPT_USER_ROLE", label: "User Role" },
} as const satisfies Record<string, UsersSearchTypeOptionsConfig>;

// Automatically extract the union of all 'code' values: "ACT" | "ARC"
export type UsersSearchTypeOptionCode = typeof UsersSearchTypeOptions[keyof typeof UsersSearchTypeOptions]["code"];
