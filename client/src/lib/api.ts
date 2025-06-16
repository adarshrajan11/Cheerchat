import { apiRequest } from "./queryClient";
import type { Recipe } from "@shared/schema";

export const api = {
  // Recipe methods
  getAllRecipes: async (): Promise<Recipe[]> => {
    const response = await apiRequest("GET", "/api/recipes");
    return response.json();
  },

  getRecipe: async (id: number): Promise<Recipe> => {
    const response = await apiRequest("GET", `/api/recipes/${id}`);
    return response.json();
  },

  searchRecipesByIngredients: async (ingredients: string[]): Promise<Recipe[]> => {
    const response = await apiRequest("POST", "/api/recipes/search/ingredients", { ingredients });
    return response.json();
  },

  searchRecipes: async (query: string): Promise<Recipe[]> => {
    const response = await apiRequest("GET", `/api/recipes/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  getRecipesByCategory: async (category: string): Promise<Recipe[]> => {
    const response = await apiRequest("GET", `/api/recipes/category/${encodeURIComponent(category)}`);
    return response.json();
  },

  getRecipesByCuisine: async (cuisine: string): Promise<Recipe[]> => {
    const response = await apiRequest("GET", `/api/recipes/cuisine/${encodeURIComponent(cuisine)}`);
    return response.json();
  },

  getAIRecommendations: async (ingredients: string[], preferences?: any): Promise<Recipe[]> => {
    const response = await apiRequest("POST", "/api/ai/recommendations", { ingredients, preferences });
    return response.json();
  },

  // Favorites methods
  getFavorites: async (): Promise<Recipe[]> => {
    const response = await apiRequest("GET", "/api/favorites");
    return response.json();
  },

  addToFavorites: async (recipeId: number): Promise<void> => {
    await apiRequest("POST", "/api/favorites", { recipeId });
  },

  removeFromFavorites: async (recipeId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/favorites/${recipeId}`);
  },

  checkIsFavorite: async (recipeId: number): Promise<boolean> => {
    const response = await apiRequest("GET", `/api/favorites/${recipeId}/check`);
    const data = await response.json();
    return data.isFavorite;
  },

  // Recent views
  getRecentViews: async (): Promise<Recipe[]> => {
    const response = await apiRequest("GET", "/api/recent");
    return response.json();
  },

  addRecentView: async (recipeId: number): Promise<void> => {
    await apiRequest("POST", "/api/recent", { recipeId });
  },
};
