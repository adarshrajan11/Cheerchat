import { users, recipes, userFavorites, recentViews, type User, type InsertUser, type Recipe, type InsertRecipe, type UserFavorite, type InsertUserFavorite, type RecentView, type InsertRecentView } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe methods
  getRecipe(id: number): Promise<Recipe | undefined>;
  getAllRecipes(): Promise<Recipe[]>;
  getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
  getRecipesByCategory(category: string): Promise<Recipe[]>;
  getRecipesByCuisine(cuisine: string): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  searchRecipes(query: string): Promise<Recipe[]>;
  
  // Favorites methods
  getUserFavorites(userId: number): Promise<Recipe[]>;
  addToFavorites(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFromFavorites(userId: number, recipeId: number): Promise<void>;
  isFavorite(userId: number, recipeId: number): Promise<boolean>;
  
  // Recent views methods
  getUserRecentViews(userId: number): Promise<Recipe[]>;
  addRecentView(view: InsertRecentView): Promise<RecentView>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  private userFavorites: Map<number, UserFavorite>;
  private recentViews: Map<number, RecentView>;
  private currentUserId: number;
  private currentRecipeId: number;
  private currentFavoriteId: number;
  private currentViewId: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.userFavorites = new Map();
    this.recentViews = new Map();
    this.currentUserId = 1;
    this.currentRecipeId = 1;
    this.currentFavoriteId = 1;
    this.currentViewId = 1;
    
    // Initialize with some sample recipes
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleRecipes: InsertRecipe[] = [
      {
        title: "Honey Garlic Chicken",
        description: "Delicious honey garlic chicken with a sweet and savory glaze",
        ingredients: ["chicken breast", "honey", "garlic", "soy sauce", "ginger", "sesame oil"],
        instructions: ["Marinate chicken", "Cook chicken in pan", "Add honey garlic sauce", "Simmer until glazed"],
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        difficulty: "Easy",
        cuisine: "Asian",
        category: "Main Course",
        imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: 5,
        reviewCount: 2100
      },
      {
        title: "Vegetable Stir-Fry",
        description: "Fresh and colorful vegetable stir-fry with a savory sauce",
        ingredients: ["bell peppers", "broccoli", "carrots", "onions", "garlic", "soy sauce", "sesame oil"],
        instructions: ["Prep vegetables", "Heat oil in wok", "Stir-fry vegetables", "Add sauce and toss"],
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        difficulty: "Easy",
        cuisine: "Asian",
        category: "Main Course",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: 5,
        reviewCount: 892
      },
      {
        title: "Classic Pasta Marinara",
        description: "Traditional pasta with rich tomato sauce and fresh basil",
        ingredients: ["pasta", "tomatoes", "garlic", "basil", "olive oil", "onions", "parmesan cheese"],
        instructions: ["Cook pasta", "Make marinara sauce", "Combine pasta and sauce", "Garnish with basil"],
        prepTime: 10,
        cookTime: 30,
        servings: 4,
        difficulty: "Easy",
        cuisine: "Italian",
        category: "Main Course",
        imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: 5,
        reviewCount: 1540
      },
      {
        title: "Fresh Garden Salad",
        description: "Crisp mixed greens with fresh vegetables and vinaigrette",
        ingredients: ["mixed greens", "tomatoes", "cucumber", "carrots", "bell peppers", "olive oil", "vinegar"],
        instructions: ["Wash and chop vegetables", "Mix greens", "Prepare vinaigrette", "Toss salad with dressing"],
        prepTime: 10,
        cookTime: 0,
        servings: 4,
        difficulty: "Easy",
        cuisine: "Mediterranean",
        category: "Salad",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: 5,
        reviewCount: 320
      }
    ];

    sampleRecipes.forEach(recipe => {
      this.createRecipe(recipe);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Recipe methods
  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    const lowerIngredients = ingredients.map(ing => ing.toLowerCase());
    return Array.from(this.recipes.values()).filter(recipe => 
      lowerIngredients.some(ingredient => 
        recipe.ingredients.some(recipeIng => 
          recipeIng.toLowerCase().includes(ingredient)
        )
      )
    );
  }

  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => 
      recipe.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getRecipesByCuisine(cuisine: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => 
      recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const recipe: Recipe = { 
      ...insertRecipe, 
      id, 
      createdAt: new Date()
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.recipes.values()).filter(recipe => 
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery)) ||
      recipe.cuisine.toLowerCase().includes(lowerQuery) ||
      recipe.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Favorites methods
  async getUserFavorites(userId: number): Promise<Recipe[]> {
    const favoriteRecipeIds = Array.from(this.userFavorites.values())
      .filter(fav => fav.userId === userId)
      .map(fav => fav.recipeId);
    
    return favoriteRecipeIds.map(id => this.recipes.get(id)).filter(Boolean) as Recipe[];
  }

  async addToFavorites(insertFavorite: InsertUserFavorite): Promise<UserFavorite> {
    const id = this.currentFavoriteId++;
    const favorite: UserFavorite = { 
      ...insertFavorite, 
      id, 
      createdAt: new Date()
    };
    this.userFavorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: number, recipeId: number): Promise<void> {
    const favorite = Array.from(this.userFavorites.entries()).find(
      ([_, fav]) => fav.userId === userId && fav.recipeId === recipeId
    );
    if (favorite) {
      this.userFavorites.delete(favorite[0]);
    }
  }

  async isFavorite(userId: number, recipeId: number): Promise<boolean> {
    return Array.from(this.userFavorites.values()).some(
      fav => fav.userId === userId && fav.recipeId === recipeId
    );
  }

  // Recent views methods
  async getUserRecentViews(userId: number): Promise<Recipe[]> {
    const recentRecipeIds = Array.from(this.recentViews.values())
      .filter(view => view.userId === userId)
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .slice(0, 10)
      .map(view => view.recipeId);
    
    return recentRecipeIds.map(id => this.recipes.get(id)).filter(Boolean) as Recipe[];
  }

  async addRecentView(insertView: InsertRecentView): Promise<RecentView> {
    // Remove existing view for same user/recipe combo
    const existing = Array.from(this.recentViews.entries()).find(
      ([_, view]) => view.userId === insertView.userId && view.recipeId === insertView.recipeId
    );
    if (existing) {
      this.recentViews.delete(existing[0]);
    }

    const id = this.currentViewId++;
    const view: RecentView = { 
      ...insertView, 
      id, 
      viewedAt: new Date()
    };
    this.recentViews.set(id, view);
    return view;
  }
}

export const storage = new MemStorage();
