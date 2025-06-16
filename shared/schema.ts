import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").$type<{
    dietaryRestrictions: string[];
    favoritesCuisines: string[];
    skillLevel: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array().notNull(),
  prepTime: integer("prep_time").notNull(), // in minutes
  cookTime: integer("cook_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard
  cuisine: text("cuisine").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  rating: integer("rating").default(0), // 0-5 stars
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recentViews = pgTable("recent_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  preferences: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).pick({
  title: true,
  description: true,
  ingredients: true,
  instructions: true,
  prepTime: true,
  cookTime: true,
  servings: true,
  difficulty: true,
  cuisine: true,
  category: true,
  imageUrl: true,
  rating: true,
  reviewCount: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).pick({
  userId: true,
  recipeId: true,
});

export const insertRecentViewSchema = createInsertSchema(recentViews).pick({
  userId: true,
  recipeId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertRecentView = z.infer<typeof insertRecentViewSchema>;
export type RecentView = typeof recentViews.$inferSelect;
