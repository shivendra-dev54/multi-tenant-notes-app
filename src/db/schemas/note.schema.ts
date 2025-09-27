import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { Tenants } from "./tenant.schema";
import { Users } from "./user.schema";

export const Notes = pgTable("notes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    userId: integer("user_id")
        .references(() => Users.id, { onDelete: "cascade" })
        .notNull(),
    tenantId: integer("tenant_id")
        .references(() => Tenants.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
