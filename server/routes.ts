import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecipeSchema, insertUserFavoriteSchema, insertRecentViewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  // Get recipe by ID
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  // Search recipes by ingredients
  app.post("/api/recipes/search/ingredients", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!Array.isArray(ingredients)) {
        return res.status(400).json({ message: "Ingredients must be an array" });
      }
      const recipes = await storage.getRecipesByIngredients(ingredients);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  // Search recipes by query
  app.get("/api/recipes/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const recipes = await storage.searchRecipes(query);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  // Get recipes by category
  app.get("/api/recipes/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const recipes = await storage.getRecipesByCategory(category);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes by category" });
    }
  });

  // Get recipes by cuisine
  app.get("/api/recipes/cuisine/:cuisine", async (req, res) => {
    try {
      const cuisine = req.params.cuisine;
      const recipes = await storage.getRecipesByCuisine(cuisine);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes by cuisine" });
    }
  });

  // AI Recipe recommendations (mock implementation)
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { ingredients, preferences } = req.body;
      
      // Simple algorithm: find recipes that match the most ingredients
      let recipes = await storage.getAllRecipes();
      
      if (ingredients && ingredients.length > 0) {
        recipes = await storage.getRecipesByIngredients(ingredients);
      }
      
      // Sort by rating and take top 5
      const recommendations = recipes
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI recommendations" });
    }
  });

  // User favorites endpoints (simplified - no auth for demo)
  const currentUserId = 1; // Mock user ID

  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(currentUserId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validation = insertUserFavoriteSchema.extend({
        userId: z.number().optional()
      }).safeParse({ ...req.body, userId: currentUserId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid favorite data" });
      }

      const favorite = await storage.addToFavorites({
        userId: currentUserId,
        recipeId: validation.data.recipeId
      });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:recipeId", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      await storage.removeFromFavorites(currentUserId, recipeId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:recipeId/check", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      const isFavorite = await storage.isFavorite(currentUserId, recipeId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Recent views
  app.get("/api/recent", async (req, res) => {
    try {
      const recent = await storage.getUserRecentViews(currentUserId);
      res.json(recent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent views" });
    }
  });

  app.post("/api/recent", async (req, res) => {
    try {
      const validation = insertRecentViewSchema.extend({
        userId: z.number().optional()
      }).safeParse({ ...req.body, userId: currentUserId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid recent view data" });
      }

      const view = await storage.addRecentView({
        userId: currentUserId,
        recipeId: validation.data.recipeId
      });
      res.status(201).json(view);
    } catch (error) {
      res.status(500).json({ message: "Failed to add recent view" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
