import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleBasedRoute } from "./components/auth/RoleBasedRoute";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Browse from "./pages/Browse";
import BrowseStores from "./pages/BrowseStores";
import ItemDetail from "./pages/ItemDetail";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile from "./pages/Profile";
import StoreProfile from "./pages/StoreProfile";
import StoreInventory from "./pages/store/StoreInventory";
import StoreDropoffs from "./pages/store/StoreDropoffs";
import StoreAnalytics from "./pages/store/StoreAnalytics";
import StoreCheckout from "./pages/store/StoreCheckout";
import AdminStores from "./pages/admin/AdminStores";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/browse-stores" element={<BrowseStores />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
                <Route path="/browse/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                {/* Store routes - require store role */}
                <Route path="/store-profile" element={<RoleBasedRoute allowedRoles={["store"]}><StoreProfile /></RoleBasedRoute>} />
                <Route path="/store/inventory" element={<RoleBasedRoute allowedRoles={["store"]}><StoreInventory /></RoleBasedRoute>} />
                <Route path="/store/dropoffs" element={<RoleBasedRoute allowedRoles={["store"]}><StoreDropoffs /></RoleBasedRoute>} />
                <Route path="/store/analytics" element={<RoleBasedRoute allowedRoles={["store"]}><StoreAnalytics /></RoleBasedRoute>} />
                <Route path="/store/checkout" element={<RoleBasedRoute allowedRoles={["store"]}><StoreCheckout /></RoleBasedRoute>} />
                
                {/* Admin routes - require admin role */}
                <Route path="/admin/stores" element={<RoleBasedRoute allowedRoles={["admin"]}><AdminStores /></RoleBasedRoute>} />
                <Route path="/admin/support" element={<RoleBasedRoute allowedRoles={["admin"]}><AdminSupport /></RoleBasedRoute>} />
                <Route path="/admin/analytics" element={<RoleBasedRoute allowedRoles={["admin"]}><AdminAnalytics /></RoleBasedRoute>} />
                <Route path="/admin/profile" element={<RoleBasedRoute allowedRoles={["admin"]}><AdminProfile /></RoleBasedRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
