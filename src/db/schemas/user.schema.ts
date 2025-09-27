import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 255 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar().notNull(),
    access_token: varchar(),
    refresh_token: varchar(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
