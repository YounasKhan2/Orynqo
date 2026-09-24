import { Account, Client, Databases } from "appwrite";
import type { AppEnvironment } from "../../config/env";
export type AppwriteServices = {
  client: Client;
  account: Account;
  databases: Databases;
};
export function createAppwriteServices(env: AppEnvironment): AppwriteServices {
  const client = new Client()
    .setEndpoint(env.VITE_APPWRITE_ENDPOINT)
    .setProject(env.VITE_APPWRITE_PROJECT_ID);
  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  };
}
