import type { EffectiveAccess } from "./contracts";
export type Capability =
  | "workItem.read"
  | "workItem.comment"
  | "workItem.update"
  | "workItem.changePriority"
  | "workItem.changeStatus";
export type AccessContext = {
  membershipState: "active" | "suspended" | "removed" | "guest";
  visible: boolean;
  lifecycle: "active" | "archived" | "deleted";
  capabilities: ReadonlySet<Capability>;
  explicitlyRestricted?: boolean;
};
export function evaluateEffectiveAccess(c: AccessContext): EffectiveAccess {
  const member =
    c.membershipState === "active" || c.membershipState === "guest";
  const discover =
    member && c.visible && !c.explicitlyRestricted && c.lifecycle !== "deleted";
  const read = discover && c.capabilities.has("workItem.read");
  const mutable = read && c.lifecycle === "active";
  return {
    discover,
    read,
    comment: mutable && c.capabilities.has("workItem.comment"),
    editProperties: mutable && c.capabilities.has("workItem.update"),
    changeStatus: mutable && c.capabilities.has("workItem.changeStatus"),
    ...(!discover ? { reason: "Resource is outside effective access." } : {}),
  };
}
