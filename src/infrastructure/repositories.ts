import type { EffectiveAccess, WorkItem } from "../domain/contracts";
export type RepositoryErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "network"
  | "unknown";
export class RepositoryError extends Error {
  constructor(
    public readonly code: RepositoryErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
export interface WorkItemReadRepository {
  getById(id: string): Promise<WorkItem>;
}
export interface AccessRepository {
  getWorkItemAccess(id: string): Promise<EffectiveAccess>;
}
export interface SearchProvider {
  search(
    query: string,
    workspaceId: string,
  ): Promise<readonly { id: string; type: string }[]>;
}
export interface StorageProvider {
  createUpload(input: {
    workspaceId: string;
    resourceId: string;
    filename: string;
    mimeType: string;
  }): Promise<{ storageKey: string }>;
}
