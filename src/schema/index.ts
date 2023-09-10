import { SchemaMigrations } from "parse-server";
import UserSchema from "./User.schema";
import AgUserSchema from "./AgUser.schema";

// @ts-ignore
export const schemas: SchemaMigrations.JSONSchema[] = [UserSchema, AgUserSchema];