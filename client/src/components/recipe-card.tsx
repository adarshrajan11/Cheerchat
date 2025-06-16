import { Heart, Star, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  variant?: "grid" | "list";
  onView?: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, variant = "grid", onView }: RecipeCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isFavorite = false } = useQuery({
    queryKey: ["/api/favorites", recipe.id, "check"],
    queryFn: () => api.checkIsFavorite(recipe.id),
  });

  const favoriteMutation = useMutation({
    mutationFn: (shouldAdd: boolean) =>
      shouldAdd ? api.addToFavorites(recipe.id) : api.removeFromFavorites(recipe.id),
    onSuccess: (_, shouldAdd) => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", recipe.id, "check"] });
      toast({
        title: shouldAdd ? "Added to favorites" : "Removed from favorites",
        description: shouldAdd ? "Recipe saved to your favorites" : "Recipe removed from favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate(!isFavorite);
  };

  const handleCardClick = async () => {
    if (onView) {
      onView(recipe);
    }
    // Add to recent views
    try {
      await api.addRecentView(recipe.id);
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
    } catch (error) {
      // Silently fail for recent views
    }
  };

  if (variant === "list") {
    return (
      <Card className="recipe-card cursor-pointer" onClick={handleCardClick}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <img
              src={recipe.imageUrl || "/api/placeholder/80/80"}
              alt={recipe.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-neutral-800 text-sm">{recipe.title}</h4>
              <p className="text-xs text-neutral-600">
                {recipe.prepTime + recipe.cookTime} min • {recipe.servings} servings
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs text-neutral-600">
                  {recipe.rating || 0} ({recipe.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={favoriteMutation.isPending}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? "text-red-500 fill-current" : "text-neutral-400"
                }`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="recipe-card cursor-pointer" onClick={handleCardClick}>
      <div className="relative">
        <img
          src={recipe.imageUrl || "/api/placeholder/300/200"}
          alt={recipe.title}
          className="w-full h-24 object-cover"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white"
          onClick={handleFavoriteToggle}
          disabled={favoriteMutation.isPending}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? "text-red-500 fill-current" : "text-neutral-400"
            }`}
          />
        </Button>
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-neutral-800 text-sm mb-1">{recipe.title}</h4>
        <div className="flex items-center space-x-2 text-xs text-neutral-600 mb-2">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{recipe.servings}</span>
          </div>
          <span className="capitalize">{recipe.difficulty}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs text-neutral-600">{recipe.rating || 0}</span>
          </div>
          <span className="text-xs text-neutral-500 px-2 py-1 bg-neutral-100 rounded">
            {recipe.cuisine}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
