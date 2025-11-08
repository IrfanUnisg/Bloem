import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockUsers, MockUser } from "@/data/mockUsers";

interface AuthContextType {
  user: MockUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: "seller" | "store") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem("bloem_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("bloem_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user by email
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: "No account found with this email" };
    }
    
    // In a real app, we'd verify the password here
    // For mock purposes, any password works
    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: "Invalid password" };
    }
    
    setUser(foundUser);
    localStorage.setItem("bloem_user", JSON.stringify(foundUser));
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string, role: "seller" | "store"): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      setIsLoading(false);
      return { success: false, error: "An account with this email already exists" };
    }
    
    // Create new user
    const newUser: MockUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem("bloem_user", JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bloem_user");
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
