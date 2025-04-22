import { pgTable, serial, text, varchar, timestamp, boolean, integer, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Role enum for user types
export const roleEnum = pgEnum("role", ["user", "admin"]);

// User table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  aadharNumber: varchar("aadhar_number", { length: 12 }).notNull().unique(),
  accountAddress: varchar("account_address", { length: 255 }),
  isRegistered: boolean("is_registered").default(false),
  hasVoted: boolean("has_voted").default(false),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define user relations
export const usersRelations = relations(users, ({ one, many }) => ({
  vote: many(votes),
}));

// Candidate table definition
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  party: varchar("party", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  qualification: varchar("qualification", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define candidate relations
export const candidatesRelations = relations(candidates, ({ many }) => ({
  votes: many(votes),
}));

// Vote table definition
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define vote relations
export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  candidate: one(candidates, {
    fields: [votes.candidateId],
    references: [candidates.id],
  }),
}));

// Election settings table for voting start/end times and other configuration
export const electionSettings = pgTable("election_settings", {
  id: serial("id").primaryKey(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  resultsVisible: boolean("results_visible").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});