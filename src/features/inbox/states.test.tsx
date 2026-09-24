import { describe, expect, it } from "vitest";
import { InboxEmpty, InboxFailure, InboxLoading } from "./components/InboxCollection";

describe("Inbox required states", () => {
  it("exports populated-state companions for empty, loading, and failure rendering", () => {
    expect(InboxEmpty).toBeTypeOf("function");
    expect(InboxLoading).toBeTypeOf("function");
    expect(InboxFailure).toBeTypeOf("function");
  });

  it("keeps loading and failure semantics explicit", () => {
    expect(InboxLoading().props["aria-label"]).toBe("Loading Inbox");
    expect(InboxFailure().props.role).toBe("alert");
  });

  it("keeps the empty state distinct from filtering UI", () => {
    const empty = InboxEmpty();
    expect(empty.props.children[0].props.children).toBe("No notifications yet");
  });
});
