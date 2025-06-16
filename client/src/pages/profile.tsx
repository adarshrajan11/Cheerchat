import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Heart, Clock, Star, ChefHat } from "lucide-react";

export default function Profile() {
  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-playfair font-bold text-xl text-neutral-800">Profile</h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-playfair text-xl font-bold text-neutral-800 mb-1">Chef Demo</h2>
            <p className="text-sm text-neutral-600 mb-4">Passionate home cook</p>
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <div className="font-bold text-lg text-primary">12</div>
                <div className="text-xs text-neutral-600">Favorites</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary">45</div>
                <div className="text-xs text-neutral-600">Tried</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary">3</div>
                <div className="text-xs text-neutral-600">Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cooking Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="w-5 h-5" />
              <span>Cooking Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Total Cooking Time</span>
              </div>
              <span className="font-medium">18.5 hours</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm">Favorite Cuisine</span>
              </div>
              <span className="font-medium">Italian</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">Average Rating</span>
              </div>
              <span className="font-medium">4.8/5</span>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dietary Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Vegetarian Friendly
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Quick Meals
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Healthy Options
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Account Settings
          </Button>
          <Button className="w-full" variant="outline">
            Help & Support
          </Button>
          <Button className="w-full" variant="outline">
            About FlavorFind
          </Button>
        </div>
      </div>
    </main>
  );
}
