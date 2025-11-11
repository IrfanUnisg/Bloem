import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { storeService } from "@/services/store.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignIn = () => {
  const navigate = useNavigate();
  const { login, logout, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Redirect if already logged in
    const checkStoreAndRedirect = async () => {
      if (user) {
        // Check if user is a store owner and if their store is approved
        if (user.role === "store") {
          const store = await storeService.getStoreByOwnerId(user.id);
          
          if (!store) {
            toast({
              title: "Store not found",
              description: "Your store application is being processed. Please contact support if this persists.",
              variant: "destructive",
            });
            await logout();
            return;
          }
          
          if (!store.verified || !store.active) {
            toast({
              title: "Store pending approval",
              description: "Your store application is pending admin approval. You'll be notified once approved.",
              variant: "destructive",
              duration: 5000,
            });
            // Log them out since they can't use the system yet
            await logout();
            return;
          }
        }
        
        const destination = user.role === "admin" 
          ? "/admin/stores" 
          : user.role === "store" 
          ? "/store/inventory" 
          : "/dashboard";
        navigate(destination);
      }
    };
    
    checkStoreAndRedirect();
  }, [user, navigate, logout, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      // Navigation and store check is handled by the useEffect above
    } else {
      toast({
        title: "Sign in failed",
        description: result.error || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="public" />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your Bloem account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1.5"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Password</Label>
                <Link to="/" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/sign-up" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SignIn;
