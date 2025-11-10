import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";
// import { userService } from "@/services/user.service"; // TODO: Enable after Prisma migration

// Extended user type with metadata
interface AuthUser extends SupabaseUser {
  role?: "seller" | "store" | "admin";
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: "seller" | "store", phone?: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const userData = session.user as AuthUser;
          // Extract role from user metadata
          userData.role = session.user.user_metadata?.role || "seller";
          userData.name = session.user.user_metadata?.name;
          setUser(userData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = session.user as AuthUser;
        userData.role = session.user.user_metadata?.role || "seller";
        userData.name = session.user.user_metadata?.name;
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { user: authUser } = await authService.signIn({ email, password });
      
      if (authUser) {
        const userData = authUser as AuthUser;
        userData.role = authUser.user_metadata?.role || "seller";
        userData.name = authUser.user_metadata?.name;
        
        // TODO: Sync user profile to database after Prisma migration
        // try {
        //   await userService.syncUserProfile(authUser.id, authUser.email!, {
        //     name: authUser.user_metadata?.name,
        //     phone: authUser.user_metadata?.phone,
        //     role: authUser.user_metadata?.role,
        //   });
        // } catch (dbError) {
        //   console.error("Error syncing user to database:", dbError);
        // }
        
        setUser(userData);
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: "Login failed" };
    } catch (error: any) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error.message || "Invalid email or password" 
      };
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    role: "seller" | "store",
    phone?: string,
    address?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { user: authUser } = await authService.signUp({
        email,
        password,
        name,
        phone,
        role,
      });
      
      if (authUser) {
        // TODO: Sync user profile to database after Prisma migration
        // try {
        //   await userService.syncUserProfile(authUser.id, email, {
        //     name,
        //     phone,
        //     role,
        //   });
        // } catch (dbError) {
        //   console.error("Error creating user profile in database:", dbError);
        // }
        
        // Note: User will need to verify email before being fully authenticated
        // Supabase will send a confirmation email automatically
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: "Signup failed" };
    } catch (error: any) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error.message || "An error occurred during signup" 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
