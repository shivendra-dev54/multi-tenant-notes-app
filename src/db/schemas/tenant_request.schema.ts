import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { Tenants } from "./tenant.schema";
import { Users } from "./user.schema";

export const TenantRequests = pgTable("tenant_requests", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    tenant_id: integer().notNull()
        .references(() => Tenants.id, { onDelete: "cascade" }),
    user_id: integer().notNull()
        .references(() => Users.id, { onDelete: "cascade" }),
    status: varchar({ length: 10 }).default("pending")
});
