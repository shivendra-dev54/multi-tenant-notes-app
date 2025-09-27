import { date, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const Tenants = pgTable("tenants", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text().notNull(),
    plan: varchar({ length: 10 }).default("Free"), // /upgrade to pro Pro
    created_at: date().defaultNow(),
    updated_at: date().defaultNow(),
});
