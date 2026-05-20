export const ROLES = {
  SUPER_ADMIN: "super_admin",
  STORE_HEAD: "store_head",
  SUPPLY_CHAIN_HEAD: "supply_chain_head",
  REFILLER: "refiller",
  BILLING_PERSON: "billing_person",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ASSIGNABLE_ROLES = [
  ROLES.STORE_HEAD,
  ROLES.SUPPLY_CHAIN_HEAD,
  ROLES.REFILLER,
  ROLES.BILLING_PERSON,
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
