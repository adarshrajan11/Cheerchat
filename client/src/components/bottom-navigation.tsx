import { Link, useLocation } from "wouter";
import { Home, Search, Heart, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/favorites", icon: Heart, label: "Saved" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="bg-white border-t border-neutral-200 px-4 py-2 sticky bottom-0">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>
                  {label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
