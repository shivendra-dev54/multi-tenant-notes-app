import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { Tenants } from "./tenant.schema";
import { Users } from "./user.schema";

export const UsersTenants = pgTable("user_tenants", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    tenant_id: integer().notNull()
        .references(() => Tenants.id, { onDelete: "cascade" }),
    user_id: integer().notNull()
        .references(() => Users.id, { onDelete: "cascade" }),
    role: varchar({ length: 10 }).default("Member")
});
