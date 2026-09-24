import { describe, expect, it } from "vitest";
import { DevelopmentMyWorkRepository } from "./repository";

const base = { userId:"user-muhammad-y",workspaceId:"workspace-product",statusFilter:"not-done" as const,group:"due" as const,sort:"priority" as const };

describe("My Work personal retrieval",()=>{
  it("retrieves only the current user's accessible Product-workspace items across projects",async()=>{const result=await new DevelopmentMyWorkRepository().list(base);expect(result.totalCount).toBeGreaterThan(1);expect(result.groups.flatMap(g=>g.items).every(item=>item.assigneeId===base.userId&&item.workspaceId===base.workspaceId)).toBe(true);expect(new Set(result.groups.flatMap(g=>g.items).map(item=>item.projectId)).size).toBeGreaterThan(1)});
  it("groups deterministically into Today then Upcoming",async()=>{const result=await new DevelopmentMyWorkRepository().list(base);expect(result.groups.map(g=>g.label)).toEqual(["Today","Upcoming"])});
  it("filters Done and supports search-in-view",async()=>{const repo=new DevelopmentMyWorkRepository();const result=await repo.list({...base,search:"role inheritance"});expect(result.groups.flatMap(g=>g.items).map(i=>i.key)).toEqual(["RB-142"]);expect(result.groups.flatMap(g=>g.items).every(i=>i.statusLabel!=="Done")).toBe(true)});
  it("can group by project without changing object containment",async()=>{const result=await new DevelopmentMyWorkRepository().list({...base,group:"project"});expect(result.groups.length).toBeGreaterThan(1);expect(result.groups.every(g=>g.items.every(i=>i.projectId===g.id))).toBe(true)});
  it("sorts urgent work before lower priorities",async()=>{const result=await new DevelopmentMyWorkRepository().list(base);const priorities=result.groups.flatMap(g=>g.items.map(i=>i.priority));expect(priorities[0]).toBe("urgent")});
});
