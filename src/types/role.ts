export enum Role {
  SUPER_ADMIN = "super_admin",
  STORE_HEAD = "store_head",
  SUPPLY_CHAIN_HEAD = "supply_chain_head",
  REFILLER = "refiller",
  BILLING_PERSON = "billing_person",
}

export const ASSIGNABLE_ROLES = [
  Role.STORE_HEAD,
  Role.SUPPLY_CHAIN_HEAD,
  Role.REFILLER,
  Role.BILLING_PERSON,
] as const;