import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import RecipeCard from "@/components/recipe-card";
import { api } from "@/lib/api";
import type { Recipe } from "@shared/schema";

export default function Favorites() {
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: api.getFavorites,
  });

  const handleRecipeView = (recipe: Recipe) => {
    // Add to recent views
    api.addRecentView(recipe.id).catch(() => {});
  };

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-500" />
            <h1 className="font-playfair font-bold text-xl text-neutral-800">My Favorites</h1>
          </div>
          <span className="text-sm text-neutral-600">
            {favorites.length} recipe{favorites.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your favorites...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                variant="list"
                onView={handleRecipeView}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="font-medium text-neutral-800 mb-2">No favorites yet</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Start exploring recipes and save your favorites here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
