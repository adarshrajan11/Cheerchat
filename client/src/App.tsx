import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";
import LoginScreen from "./components/login-screen";
import { AuthProvider } from "./hooks/use-auth";

function Router() {

  return (

    <div className="app-container">
      <Switch>

        <Route path="/" component={LoginScreen} />
        <Route path="/chat" component={ChatPage} />
        <Route component={NotFound} />
      </Switch>

    </div>
  );
}

function App() {
  return (

    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* AuthProvider wraps the entire app to provide auth context */}
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>

  );
}

export default App;
