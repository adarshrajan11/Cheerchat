import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Search, Camera, Sparkles, Clock, Leaf, Cake, Globe } from "lucide-react";
import RecipeCard from "@/components/recipe-card";
import IngredientChip from "@/components/ingredient-chip";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@shared/schema";

const popularIngredients = [
  "Carrots", "Chicken", "Garlic", "Onions", "Tomatoes", "Bell Peppers",
  "Rice", "Pasta", "Cheese", "Eggs", "Spinach", "Mushrooms"
];

const categories = [
  { name: "Quick Meals", icon: Clock, color: "from-orange-500 to-yellow-500", description: "Under 30 minutes" },
  { name: "Healthy", icon: Leaf, color: "from-green-500 to-green-600", description: "Nutritious options" },
  { name: "Desserts", icon: Cake, color: "from-purple-500 to-pink-500", description: "Sweet treats" },
  { name: "World Cuisine", icon: Globe, color: "from-blue-500 to-cyan-500", description: "Global flavors" },
];

export default function Home() {
  const [aiQuery, setAiQuery] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: allRecipes = [] } = useQuery({
    queryKey: ["/api/recipes"],
    queryFn: api.getAllRecipes,
  });

  const { data: recentRecipes = [] } = useQuery({
    queryKey: ["/api/recent"],
    queryFn: api.getRecentViews,
  });

  const aiRecommendationsMutation = useMutation({
    mutationFn: (ingredients: string[]) => api.getAIRecommendations(ingredients),
    onSuccess: (recommendations) => {
      setIsLoading(false);
      if (recommendations.length === 0) {
        toast({
          title: "No recipes found",
          description: "Try different ingredients or browse our recipe collection.",
        });
      } else {
        toast({
          title: "Recommendations ready!",
          description: `Found ${recommendations.length} recipes for you.`,
        });
      }
    },
    onError: () => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to get AI recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: aiRecommendations = [] } = useQuery({
    queryKey: ["/api/ai/recommendations", selectedIngredients],
    queryFn: () => api.getAIRecommendations(selectedIngredients),
    enabled: selectedIngredients.length > 0,
  });

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    
    setIsLoading(true);
    // Extract ingredients from natural language query (simplified)
    const words = aiQuery.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
    const foundIngredients = popularIngredients.filter(ing => 
      words.some(word => ing.toLowerCase().includes(word))
    );
    
    if (foundIngredients.length > 0) {
      setSelectedIngredients(prev => [...new Set([...prev, ...foundIngredients])]);
    }
    
    aiRecommendationsMutation.mutate([...selectedIngredients, ...foundIngredients]);
  };

  const handleFindRecipes = () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please select at least one ingredient to find recipes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    aiRecommendationsMutation.mutate(selectedIngredients);
  };

  const handleRecipeView = (recipe: Recipe) => {
    toast({
      title: "Recipe details",
      description: `${recipe.title} - ${recipe.description}`,
    });
  };

  const topRatedRecipes = allRecipes
    .filter(recipe => (recipe.rating || 0) >= 4.5)
    .slice(0, 2);

  return (
    <main className="flex-1 overflow-y-auto pb-4">
      {/* Hero Section */}
      <section className="p-4 gradient-primary text-white">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2 font-playfair">Good afternoon, Chef!</h2>
          <p className="text-white/90 text-sm">What delicious dish shall we create today?</p>
        </div>
        
        {/* AI-Powered Search Bar */}
        <Card className="bg-white text-neutral-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">AI Recipe Assistant</span>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Tell me what ingredients you have..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="pr-12"
                onKeyPress={(e) => e.key === "Enter" && handleAISearch()}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={handleAISearch}
                disabled={isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Ingredient Selection */}
      <section className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-neutral-800">Quick Ingredient Selection</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {popularIngredients.map(ingredient => (
            <IngredientChip
              key={ingredient}
              ingredient={ingredient}
              selected={selectedIngredients.includes(ingredient)}
              onToggle={handleIngredientToggle}
            />
          ))}
        </div>

        <Button
          onClick={handleFindRecipes}
          className="w-full gradient-secondary text-white"
          disabled={isLoading || selectedIngredients.length === 0}
        >
          <Search className="w-4 h-4 mr-2" />
          Find Recipes
        </Button>
      </section>

      {/* AI Recommendations */}
      {(aiRecommendations.length > 0 || selectedIngredients.length > 0) && (
        <section className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-neutral-200">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-neutral-800">AI Recommendations</h3>
          </div>
          <p className="text-sm text-neutral-600 mb-4">
            {selectedIngredients.length > 0 
              ? `Based on: ${selectedIngredients.join(", ")}`
              : "Based on your cooking history and preferences"
            }
          </p>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-neutral-600">Finding perfect recipes...</p>
              </div>
            ) : aiRecommendations.length > 0 ? (
              aiRecommendations.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  variant="list"
                  onView={handleRecipeView}
                />
              ))
            ) : selectedIngredients.length > 0 ? (
              <p className="text-sm text-neutral-600 text-center py-4">
                No recipes found with selected ingredients. Try different combinations!
              </p>
            ) : (
              topRatedRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  variant="list"
                  onView={handleRecipeView}
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentRecipes.length > 0 && (
        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-800">Recently Viewed</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {recentRecipes.slice(0, 4).map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={handleRecipeView}
              />
            ))}
          </div>
        </section>
      )}

      {/* Explore Categories */}
      <section className="p-4">
        <h3 className="font-medium text-neutral-800 mb-4">Explore Categories</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {categories.map(({ name, icon: Icon, color, description }) => (
            <Card
              key={name}
              className={`cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br ${color} text-white`}
              onClick={() => {
                toast({
                  title: `Exploring ${name}`,
                  description: `Browse ${description.toLowerCase()}`,
                });
              }}
            >
              <CardContent className="p-4">
                <Icon className="w-6 h-6 mb-2" />
                <h4 className="font-medium">{name}</h4>
                <p className="text-xs text-white/80">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <Button className="fab" onClick={() => {
        toast({
          title: "Camera feature",
          description: "Scan ingredients with your camera - coming soon!",
        });
      }}>
        <Camera className="w-5 h-5" />
      </Button>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="max-w-sm mx-4">
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="font-medium text-neutral-800 mb-2">Finding Perfect Recipes</h3>
              <p className="text-sm text-neutral-600">Our AI is analyzing your ingredients...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
