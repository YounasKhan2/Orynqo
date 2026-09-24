import { z } from "zod";
const EnvSchema=z.object({VITE_APPWRITE_ENDPOINT:z.string().url(),VITE_APPWRITE_PROJECT_ID:z.string().min(1),VITE_APPWRITE_DATABASE_ID:z.string().min(1),VITE_ORYNQO_ENV:z.enum(["development","production"]).default("development")});
export type AppEnvironment=z.infer<typeof EnvSchema>;
export function readEnvironment(source:Record<string,unknown>=import.meta.env):AppEnvironment{return EnvSchema.parse(source);}
