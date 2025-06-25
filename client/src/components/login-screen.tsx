import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Users, Shield, Zap } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function LoginScreen() {
  const { user, signIn, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [, navigate] = useLocation(); // Correct wouter hook usage

  useEffect(() => {
    console.log("LoginScreen mounted, checking user state", user);
    if (user) {
      navigate("/chat"); // Redirect if already signed in
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
      console.log(`✅ Successfully signed in`);
    } catch (error) {
      console.error("❌ Google sign-in failed:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Send and receive messages instantly with live updates",
    },
    {
      icon: Users,
      title: "Group Chats",
      description: "Create group conversations with multiple participants",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your messages are encrypted and stored securely",
    },
    {
      icon: Zap,
      title: "File Sharing",
      description: "Share images, documents, and files seamlessly",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {(loading || isSigningIn) && (
        <span className="absolute top-4 right-4 animate-spin text-xl">⏳</span>
      )}
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
            💬
          </div>
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Welcome to Chat
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Connect with friends, family, and colleagues through secure real-time messaging with multimedia support
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription className="text-base">
                  Sign in with Google to start chatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleLogin}
                  disabled={loading || isSigningIn}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center text-sm text-neutral-500">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-500 text-sm">
            Built with Firebase • Secure & Fast • Material Design
          </p>
        </div>
      </div>
    </div>
  );
}
