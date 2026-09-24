import { describe, expect, it } from "vitest";
import { evaluateEffectiveAccess, type Capability } from "./access";
const editor = new Set<Capability>([
  "workItem.read",
  "workItem.comment",
  "workItem.update",
  "workItem.changePriority",
  "workItem.changeStatus",
]);
describe("effective access", () => {
  it("allows active editor", () =>
    expect(
      evaluateEffectiveAccess({
        membershipState: "active",
        visible: true,
        lifecycle: "active",
        capabilities: editor,
      }).editProperties,
    ).toBe(true));
  it("archives are read-only", () => {
    const r = evaluateEffectiveAccess({
      membershipState: "active",
      visible: true,
      lifecycle: "archived",
      capabilities: editor,
    });
    expect(r.read).toBe(true);
    expect(r.editProperties).toBe(false);
  });
  it("removed member cannot discover", () =>
    expect(
      evaluateEffectiveAccess({
        membershipState: "removed",
        visible: true,
        lifecycle: "active",
        capabilities: editor,
      }).discover,
    ).toBe(false));
});
