import { describe, expect, it, beforeEach } from "vitest";
import { rb142DevelopmentServer } from "./development-server";
import { RB142_COMMENT, type Rb142Command } from "./model";

const command = (
  commandType: Rb142Command["commandType"],
  expectedVersion: number,
  mutationId: string,
  payload: Rb142Command["payload"],
): Rb142Command => ({ commandType, expectedVersion, mutationId, actorId: "user-muhammad-y", workspaceId: "workspace-product", resourceId: "wi-rb-142", payload });

describe("RB-142 server-authoritative development contract", () => {
  beforeEach(() => rb142DevelopmentServer.reset());

  it("executes the complete Golden Flow with server-owned versions and newest-first Activity", async () => {
    const priority = await rb142DevelopmentServer.execute(command("workItem.changePriority", 7, "m-priority", { priority: "urgent" }));
    expect(priority.ok && priority.canonical.workItem).toMatchObject({ priority: "urgent", version: 8 });
    const comment = await rb142DevelopmentServer.execute(command("workItem.createComment", 8, "m-comment", { body: RB142_COMMENT }));
    expect(comment.ok && comment.canonical.comments).toHaveLength(1);
    const status = await rb142DevelopmentServer.execute(command("workItem.transitionStatus", 9, "m-status", { statusId: "status-review" }));
    expect(status.ok && status.canonical.workItem).toMatchObject({ statusId: "status-review", statusLabel: "Review", version: 10 });
    if (!status.ok) throw new Error("expected success");
    expect(status.canonical.activity.slice(0, 3).map((event) => event.type)).toEqual([
      "workItem.status.changed", "workItem.comment.created", "workItem.priority.changed",
    ]);
    expect(status.canonical.activity.at(-1)?.type).toBe("workItem.created");
  });

  it("rolls back logically on failure without Activity/version change", async () => {
    rb142DevelopmentServer.setRegressionMode("failure");
    const result = await rb142DevelopmentServer.execute(command("workItem.changePriority", 7, "m1", { priority: "urgent" }));
    expect(result).toMatchObject({ ok: false, code: "transport_error" });
    expect(rb142DevelopmentServer.read().workItem).toMatchObject({ priority: "high", version: 7 });
    expect(rb142DevelopmentServer.read().activity).toHaveLength(1);
  });

  it("makes comment mutationId idempotent", async () => {
    const cmd = command("workItem.createComment", 7, "m-comment", { body: RB142_COMMENT });
    const first = await rb142DevelopmentServer.execute(cmd);
    const replay = await rb142DevelopmentServer.execute(cmd);
    expect(first.ok && first.replayed).toBe(false);
    expect(replay.ok && replay.replayed).toBe(true);
    expect(rb142DevelopmentServer.read().comments).toHaveLength(1);
    expect(rb142DevelopmentServer.read().activity.filter((e) => e.type === "workItem.comment.created")).toHaveLength(1);
  });

  it("rejects stale expectedVersion as conflict", async () => {
    const result = await rb142DevelopmentServer.execute(command("workItem.changePriority", 6, "m1", { priority: "urgent" }));
    expect(result).toMatchObject({ ok: false, code: "conflict" });
  });

  it("keeps forbidden distinct and preserves canonical data", async () => {
    rb142DevelopmentServer.revokeAccess();
    const result = await rb142DevelopmentServer.execute(command("workItem.changePriority", 7, "m1", { priority: "urgent" }));
    expect(result).toMatchObject({ ok: false, code: "forbidden" });
    expect(rb142DevelopmentServer.read().workItem.priority).toBe("high");
  });

  it("enforces the In Progress to Review workflow transition", async () => {
    const result = await rb142DevelopmentServer.execute(command("workItem.transitionStatus", 7, "m1", { statusId: "status-review" }));
    expect(result.ok && result.canonical.workItem.statusLabel).toBe("Review");
  });

  it("preserves unrelated data invariants", async () => {
    const before = rb142DevelopmentServer.read().workItem;
    const result = await rb142DevelopmentServer.execute(command("workItem.changePriority", 7, "m1", { priority: "urgent" }));
    if (!result.ok) throw new Error("expected success");
    expect(result.canonical.workItem).toMatchObject({
      assigneeId: before.assigneeId, cycleId: before.cycleId, projectId: before.projectId, milestoneId: before.milestoneId,
    });
  });

  it("represents archive and delete separately", () => {
    expect(rb142DevelopmentServer.remoteArchive().workItem.lifecycle).toBe("archived");
    rb142DevelopmentServer.reset();
    expect(rb142DevelopmentServer.remoteDelete().unavailable).toBe(true);
  });

  it("applies an unrelated remote assignee update without touching Priority", () => {
    const snapshot = rb142DevelopmentServer.remoteAssigneeChange();
    expect(snapshot.workItem).toMatchObject({ priority: "high", assigneeLabel: "N. Chen", version: 8 });
  });
});
