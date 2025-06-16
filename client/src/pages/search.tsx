import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, Filter } from "lucide-react";
import RecipeCard from "@/components/recipe-card";
import { api } from "@/lib/api";
import type { Recipe } from "@shared/schema";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["/api/recipes/search", searchQuery],
    queryFn: () => api.searchRecipes(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const { data: allRecipes = [] } = useQuery({
    queryKey: ["/api/recipes"],
    queryFn: api.getAllRecipes,
  });

  const { data: categoryRecipes = [] } = useQuery({
    queryKey: ["/api/recipes/category", selectedCategory],
    queryFn: () => api.getRecipesByCategory(selectedCategory),
    enabled: !!selectedCategory,
  });

  const categories = ["Main Course", "Salad", "Dessert", "Appetizer", "Breakfast"];
  const cuisines = ["Italian", "Asian", "Mediterranean", "Mexican", "American"];

  const displayedRecipes = searchQuery.length > 2 
    ? searchResults 
    : selectedCategory 
    ? categoryRecipes 
    : allRecipes;

  const handleRecipeView = (recipe: Recipe) => {
    // Add to recent views
    api.addRecentView(recipe.id).catch(() => {});
  };

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-playfair font-bold text-xl text-neutral-800">Search Recipes</h1>
          <Button variant="ghost" size="sm">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search recipes, ingredients, or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="mb-6">
          <h3 className="font-medium text-neutral-800 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-800">
              {searchQuery.length > 2 
                ? `Results for "${searchQuery}"` 
                : selectedCategory 
                ? `${selectedCategory} Recipes`
                : "All Recipes"
              }
            </h3>
            <span className="text-sm text-neutral-600">
              {displayedRecipes.length} recipe{displayedRecipes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">Searching recipes...</p>
            </div>
          ) : displayedRecipes.length > 0 ? (
            <div className="space-y-3">
              {displayedRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  variant="list"
                  onView={handleRecipeView}
                />
              ))}
            </div>
          ) : searchQuery.length > 2 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <SearchIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="font-medium text-neutral-800 mb-2">No recipes found</h3>
                <p className="text-sm text-neutral-600">
                  Try different keywords or browse our categories
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Popular Cuisines */}
        <div className="mb-6">
          <h3 className="font-medium text-neutral-800 mb-3">Popular Cuisines</h3>
          <div className="grid grid-cols-2 gap-3">
            {cuisines.map(cuisine => (
              <Card key={cuisine} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{cuisine}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
