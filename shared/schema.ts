import { pgTable, text, uuid, timestamp, boolean, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const userRoleEnum = pgEnum('user_role', ['customer', 'facility_owner', 'admin']);

// Enum for user status
export const userStatusEnum = pgEnum('user_status', ['active', 'banned', 'inactive']);

// Enum for property status
export const propertyStatusEnum = pgEnum('property_status', ['active', 'inactive', 'maintenance']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  full_name: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").default('active'),
  avatar_url: text("avatar_url"),
  phone: text("phone"),
  address: text("address"),
  business_name: text("business_name"), // For facility owners
  business_address: text("business_address"), // For facility owners
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Facility availability table
export const facilityAvailability = pgTable("facility_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  property_name: text("property_name").notNull(),
  property_type: text("property_type").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  current_status: propertyStatusEnum("current_status").default('active'),
  is_sold: boolean("is_sold").default(false),
  current_booking_start: timestamp("current_booking_start"),
  current_booking_end: timestamp("current_booking_end"),
  next_available_time: timestamp("next_available_time"),
  total_booked_hours: decimal("total_booked_hours", { precision: 5, scale: 2 }).default('0'),
  monthly_booked_hours: decimal("monthly_booked_hours", { precision: 5, scale: 2 }).default('0'),
  price_per_hour: decimal("price_per_hour", { precision: 10, scale: 2 }).default('25.00'),
  operating_hours: jsonb("operating_hours").default('{"start": "09:00", "end": "18:00"}'),
  contact_phone: text("contact_phone"),
  contact_email: text("contact_email"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  full_name: true,
  role: true,
  phone: true,
  address: true,
  business_name: true,
  business_address: true
});

export const insertFacilitySchema = createInsertSchema(facilityAvailability).pick({
  user_id: true,
  property_name: true,
  property_type: true,
  address: true,
  description: true,
  price_per_hour: true,
  contact_phone: true,
  contact_email: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type User = typeof users.$inferSelect;
export type FacilityAvailability = typeof facilityAvailability.$inferSelect;

// Facility owner statistics view type
export interface FacilityOwnerStats {
  user_id: string;
  full_name: string;
  business_name: string | null;
  total_properties: number;
  active_properties: number;
  maintenance_properties: number;
  sold_properties: number;
  total_booked_hours: number;
  monthly_booked_hours: number;
  estimated_monthly_revenue: number;
}
